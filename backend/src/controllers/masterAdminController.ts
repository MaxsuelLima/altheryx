import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";
import { z } from "zod";

const workspaceSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  nome: z.string().min(2),
  descricao: z.string().nullable().optional(),
});

const adminUsuarioSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
});

export async function listarWorkspaces(_req: Request, res: Response) {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        _count: { select: { usuarios: true } },
      },
    });
    return res.json(workspaces);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar workspaces" });
  }
}

export async function criarWorkspace(req: Request, res: Response) {
  try {
    const dados = workspaceSchema.parse(req.body);
    const adminData = req.body.admin ? adminUsuarioSchema.parse(req.body.admin) : null;

    const existente = await prisma.workspace.findUnique({ where: { slug: dados.slug } });
    if (existente) {
      return res.status(409).json({ error: "Já existe um workspace com esse slug" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        slug: dados.slug,
        nome: dados.nome,
        descricao: dados.descricao,
      },
    });

    let admin = null;
    if (adminData) {
      const senhaHash = await hashPassword(adminData.senha);
      admin = await prisma.usuario.create({
        data: {
          nome: adminData.nome,
          email: adminData.email,
          senha: senhaHash,
          role: "ADMIN",
          isAdmin: true,
          workspaceId: workspace.id,
        },
        select: { id: true, nome: true, email: true, role: true },
      });
    }

    return res.status(201).json({ workspace, admin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar workspace" });
  }
}

export async function atualizarWorkspace(req: Request, res: Response) {
  try {
    const dados = workspaceSchema.partial().parse(req.body);
    const ativo = req.body.ativo;

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id as string },
      data: {
        ...dados,
        ...(ativo !== undefined && { ativo }),
      },
    });

    return res.json(workspace);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar workspace" });
  }
}

export async function buscarWorkspace(req: Request, res: Response) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id as string },
      include: {
        usuarios: {
          where: { deletadoEm: null },
          select: { id: true, nome: true, email: true, role: true, isAdmin: true, ativo: true, criadoEm: true },
          orderBy: { criadoEm: "asc" },
        },
        _count: { select: { usuarios: true, processos: true, clientes: true } },
      },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace não encontrado" });
    }

    return res.json(workspace);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar workspace" });
  }
}

export async function adicionarUsuarioWorkspace(req: Request, res: Response) {
  try {
    const dados = adminUsuarioSchema.parse(req.body);
    const role = req.body.role || "ESTAGIARIO";
    const isAdmin = req.body.isAdmin || false;
    const workspaceId = req.params.id as string;

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ error: "Workspace não encontrado" });
    }

    const existente = await prisma.usuario.findFirst({
      where: { email: dados.email, workspaceId, deletadoEm: null },
    });
    if (existente) {
      return res.status(409).json({ error: "Já existe um usuário com esse email neste workspace" });
    }

    const senhaHash = await hashPassword(dados.senha);
    const usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        role,
        isAdmin,
        workspaceId,
      },
      select: { id: true, nome: true, email: true, role: true, isAdmin: true },
    });

    return res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}
