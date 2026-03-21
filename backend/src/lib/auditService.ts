import { Request } from "express";
import { AcaoAuditoria } from "@prisma/client";
import { prisma } from "./prisma";

export function getUsuario(req: Request): string {
  if (req.user?.userName) return req.user.userName;
  return (req.headers["x-usuario"] as string) || "sistema";
}

export function getWorkspaceId(req: Request): string | undefined {
  return req.workspaceId || req.user?.workspaceId || undefined;
}

export function getIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
}

export async function registrarAuditoria(params: {
  entidade: string;
  entidadeId: string;
  acao: AcaoAuditoria;
  dadosAnteriores?: unknown;
  dadosNovos?: unknown;
  usuario: string;
  ip?: string;
  workspaceId?: string;
}) {
  await prisma.auditLog.create({
    data: {
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      acao: params.acao,
      dadosAnteriores: params.dadosAnteriores !== undefined ? (params.dadosAnteriores as object) : undefined,
      dadosNovos: params.dadosNovos !== undefined ? (params.dadosNovos as object) : undefined,
      usuario: params.usuario,
      ip: params.ip || null,
      workspaceId: params.workspaceId || null,
    },
  });
}

export const ENTIDADES_SENSIVEIS = ["Processo", "Financeiro"];

export async function criarAprovacao(params: {
  entidade: string;
  entidadeId: string;
  dadosAtuais: unknown;
  dadosPropostos: unknown;
  solicitadoPor: string;
  workspaceId?: string;
}) {
  return prisma.aprovacaoPendente.create({
    data: {
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      dadosAtuais: params.dadosAtuais as object,
      dadosPropostos: params.dadosPropostos as object,
      solicitadoPor: params.solicitadoPor,
      workspaceId: params.workspaceId || null,
    },
  });
}
