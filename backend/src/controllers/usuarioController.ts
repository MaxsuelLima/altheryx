import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";
import { z } from "zod";
const usuarioSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  role: z.enum(["ADMIN", "ADVOGADO", "ESTAGIARIO", "SECRETARIA"]).optional(),
  isAdmin: z.boolean().optional(),
});

export async function listarUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        workspaceId: req.workspaceId!,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        isAdmin: true,
        ativo: true,
        criadoEm: true,
      },
      orderBy: { nome: "asc" },
    });
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
}

export async function criarUsuario(req: Request, res: Response) {
  try {
    const dados = usuarioSchema.parse(req.body);

    const existente = await prisma.usuario.findFirst({
      where: { email: dados.email, workspaceId: req.workspaceId! },
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
        role: dados.role || "ESTAGIARIO",
        isAdmin: dados.isAdmin || false,
        workspaceId: req.workspaceId!,
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

export async function atualizarUsuario(req: Request, res: Response) {
  try {
    const dados = usuarioSchema.partial().parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (dados.nome) updateData.nome = dados.nome;
    if (dados.email) updateData.email = dados.email;
    if (dados.role) updateData.role = dados.role;
    if (dados.isAdmin !== undefined) updateData.isAdmin = dados.isAdmin;
    if (dados.senha) updateData.senha = await hashPassword(dados.senha);
    if (req.body.ativo !== undefined) updateData.ativo = req.body.ativo;

    const usuario = await prisma.usuario.update({
      where: { id: (req.params.id as string) },
      data: updateData,
      select: { id: true, nome: true, email: true, role: true, isAdmin: true, ativo: true },
    });

    return res.json(usuario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
}

export async function excluirUsuario(req: Request, res: Response) {
  try {
    const anterior = await prisma.usuario.findFirst({
      where: { id: (req.params.id as string), workspaceId: req.workspaceId! },
    });
    if (!anterior) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (anterior.id === req.user!.userId) {
      return res.status(400).json({ error: "Não é possível excluir o próprio usuário" });
    }

    await prisma.usuario.update({
      where: { id: (req.params.id as string) },
      data: { deletadoEm: new Date(), deletadoPor: req.user!.userName },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir usuário" });
  }
}
