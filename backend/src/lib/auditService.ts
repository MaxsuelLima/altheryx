import { Request } from "express";
import { AcaoAuditoria } from "@prisma/client";
import { prisma } from "./prisma";

export function getUsuario(req: Request): string {
  return (req.headers["x-usuario"] as string) || "sistema";
}

export async function registrarAuditoria(params: {
  entidade: string;
  entidadeId: string;
  acao: AcaoAuditoria;
  dadosAnteriores?: unknown;
  dadosNovos?: unknown;
  usuario: string;
}) {
  await prisma.auditLog.create({
    data: {
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      acao: params.acao,
      dadosAnteriores: params.dadosAnteriores !== undefined ? (params.dadosAnteriores as object) : undefined,
      dadosNovos: params.dadosNovos !== undefined ? (params.dadosNovos as object) : undefined,
      usuario: params.usuario,
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
}) {
  return prisma.aprovacaoPendente.create({
    data: {
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      dadosAtuais: params.dadosAtuais as object,
      dadosPropostos: params.dadosPropostos as object,
      solicitadoPor: params.solicitadoPor,
    },
  });
}
