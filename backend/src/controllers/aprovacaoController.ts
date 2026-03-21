import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prognostico, FormaPagamento } from "@prisma/client";

export async function listarAprovacoes(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;

    const aprovacoes = await prisma.aprovacaoPendente.findMany({
      where: {
        workspaceId: req.workspaceId!,
        ...(status ? { status: status as never } : { status: "PENDENTE" }),
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(aprovacoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar aprovações" });
  }
}

export async function buscarAprovacao(req: Request<{ id: string }>, res: Response) {
  try {
    const aprovacao = await prisma.aprovacaoPendente.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
    });
    if (!aprovacao) return res.status(404).json({ error: "Aprovação não encontrada" });
    return res.json(aprovacao);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar aprovação" });
  }
}

export async function aprovarAlteracao(req: Request<{ id: string }>, res: Response) {
  try {
    const usuario = req.user?.userName || "sistema";
    const aprovacao = await prisma.aprovacaoPendente.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
    });

    if (!aprovacao) return res.status(404).json({ error: "Aprovação não encontrada" });
    if (aprovacao.status !== "PENDENTE") {
      return res.status(400).json({ error: "Esta aprovação já foi processada" });
    }

    const dados = aprovacao.dadosPropostos as Record<string, unknown>;

    if (aprovacao.entidade === "Processo") {
      await prisma.processo.update({
        where: { id: aprovacao.entidadeId },
        data: {
          ...dados,
          valorCausa: dados.valorCausa !== undefined ? (dados.valorCausa as number ?? undefined) : undefined,
        },
      });
    } else if (aprovacao.entidade === "Financeiro") {
      await prisma.financeiro.update({
        where: { id: aprovacao.entidadeId },
        data: {
          ...dados,
          prognostico: dados.prognostico as Prognostico | undefined,
          formaPagamento: dados.formaPagamento as FormaPagamento | undefined,
        },
      });
    }

    const resultado = await prisma.aprovacaoPendente.update({
      where: { id: req.params.id },
      data: {
        status: "APROVADA",
        aprovadoPor: usuario,
        resolvidoEm: new Date(),
      },
    });

    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao aprovar alteração" });
  }
}

export async function rejeitarAlteracao(req: Request<{ id: string }>, res: Response) {
  try {
    const usuario = req.user?.userName || "sistema";
    const { motivo } = req.body as { motivo?: string };

    const aprovacao = await prisma.aprovacaoPendente.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
    });

    if (!aprovacao) return res.status(404).json({ error: "Aprovação não encontrada" });
    if (aprovacao.status !== "PENDENTE") {
      return res.status(400).json({ error: "Esta aprovação já foi processada" });
    }

    const resultado = await prisma.aprovacaoPendente.update({
      where: { id: req.params.id },
      data: {
        status: "REJEITADA",
        aprovadoPor: usuario,
        motivoRejeicao: motivo || null,
        resolvidoEm: new Date(),
      },
    });

    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao rejeitar alteração" });
  }
}

export async function dashboardAprovacoes(req: Request, res: Response) {
  try {
    const [pendentes, aprovadas, rejeitadas] = await Promise.all([
      prisma.aprovacaoPendente.count({ where: { workspaceId: req.workspaceId!, status: "PENDENTE" } }),
      prisma.aprovacaoPendente.count({ where: { workspaceId: req.workspaceId!, status: "APROVADA" } }),
      prisma.aprovacaoPendente.count({ where: { workspaceId: req.workspaceId!, status: "REJEITADA" } }),
    ]);

    return res.json({ pendentes, aprovadas, rejeitadas });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar dashboard" });
  }
}
