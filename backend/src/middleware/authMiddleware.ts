import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";
import { prisma } from "../lib/prisma";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function requireMaster(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isMaster) {
    return res.status(403).json({ error: "Acesso restrito ao administrador master" });
  }
  next();
}

export function requireWorkspaceAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin && !req.user?.isMaster) {
    return res.status(403).json({ error: "Acesso restrito ao administrador do workspace" });
  }
  next();
}

export async function injectWorkspace(req: Request, res: Response, next: NextFunction) {
  if (req.user?.isMaster) {
    return next();
  }

  if (!req.user?.workspaceId) {
    return res.status(401).json({ error: "Workspace não identificado" });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: req.user.workspaceId },
  });

  if (!workspace || !workspace.ativo) {
    return res.status(403).json({ error: "Workspace inativo ou não encontrado" });
  }

  req.workspaceId = workspace.id;
  next();
}
