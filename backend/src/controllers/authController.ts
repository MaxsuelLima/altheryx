import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { comparePassword, generateToken, generateMasterToken } from "../lib/auth";

export async function login(req: Request, res: Response) {
  try {
    const { email, senha, workspaceSlug } = req.body;

    if (!email || !senha || !workspaceSlug) {
      return res.status(400).json({ error: "Email, senha e workspace são obrigatórios" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace || !workspace.ativo) {
      return res.status(404).json({ error: "Workspace não encontrado ou inativo" });
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        email,
        workspaceId: workspace.id,
        deletadoEm: null,
        ativo: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaValida = await comparePassword(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = generateToken({
      userId: usuario.id,
      userName: usuario.nome,
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
      role: usuario.role,
      isAdmin: usuario.isAdmin,
    });

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        isAdmin: usuario.isAdmin,
      },
      workspace: {
        id: workspace.id,
        slug: workspace.slug,
        nome: workspace.nome,
        descricao: workspace.descricao,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao realizar login" });
  }
}

export async function masterLogin(req: Request, res: Response) {
  try {
    const { senha } = req.body;
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD;

    if (!masterPassword) {
      return res.status(500).json({ error: "Senha master não configurada no servidor" });
    }

    if (senha !== masterPassword) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    const token = generateMasterToken();
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao realizar login master" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (req.user?.isMaster) {
      return res.json({
        id: "master",
        nome: "Master Admin",
        role: "MASTER_ADMIN",
        isMaster: true,
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user!.userId },
      include: { workspace: { select: { id: true, slug: true, nome: true, descricao: true } } },
    });

    if (!usuario || usuario.deletadoEm) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      isAdmin: usuario.isAdmin,
      workspace: usuario.workspace,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar dados do usuário" });
  }
}

export async function getWorkspaceInfo(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true, slug: true, nome: true, descricao: true, ativo: true },
    });

    if (!workspace || !workspace.ativo) {
      return res.status(404).json({ error: "Workspace não encontrado" });
    }

    return res.json(workspace);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar workspace" });
  }
}
