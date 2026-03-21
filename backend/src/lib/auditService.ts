import { prismaBase } from "./prisma";

export const ENTIDADES_SENSIVEIS = ["Processo", "Financeiro"];

export async function criarAprovacao(params: {
  entidade: string;
  entidadeId: string;
  dadosAtuais: unknown;
  dadosPropostos: unknown;
  solicitadoPor: string;
  workspaceId?: string;
}) {
  return prismaBase.aprovacaoPendente.create({
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
