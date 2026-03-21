import { Request, Response } from "express";
import { Prognostico, FormaPagamento, StatusParcela } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario, criarAprovacao, ENTIDADES_SENSIVEIS, getIp } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const financeiroSchema = z.object({
  prognostico: z.enum(["PROVAVEL", "POSSIVEL", "REMOTA"]).optional(),
  valorCausaEstimado: z.number().nullable().optional(),
  honorariosContrato: z.number().nullable().optional(),
  honorariosExito: z.number().nullable().optional(),
  percentualExito: z.number().min(0).max(100).nullable().optional(),
  formaPagamento: z.enum(["A_VISTA", "PARCELADO", "HONORARIOS_EXITO", "MISTO"]).optional(),
  observacoes: z.string().nullable().optional(),
});

const parcelaSchema = z.object({
  numero: z.number().int().positive(),
  valor: z.number().positive(),
  dataVencimento: z.string().transform((s) => new Date(s)),
  dataPagamento: z.string().transform((s) => new Date(s)).nullable().optional(),
  status: z.enum(["PENDENTE", "PAGA", "ATRASADA", "CANCELADA"]).optional(),
  observacoes: z.string().nullable().optional(),
});

export async function buscarFinanceiro(req: IdParam, res: Response) {
  try {
    let financeiro = await prisma.financeiro.findFirst({
      where: { processoId: req.params.id, workspaceId: req.workspaceId! },
      include: {
        parcelas: { where: { deletadoEm: null }, orderBy: { numero: "asc" } },
        processo: {
          select: { numeroProcesso: true, valorCausa: true, assunto: true, competencia: true },
        },
      },
    });

    if (!financeiro) {
      financeiro = await prisma.financeiro.create({
        data: { processoId: req.params.id, workspaceId: req.workspaceId! },
        include: {
          parcelas: { where: { deletadoEm: null }, orderBy: { numero: "asc" } },
          processo: {
            select: { numeroProcesso: true, valorCausa: true, assunto: true, competencia: true },
          },
        },
      });
    }

    return res.json(financeiro);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar financeiro" });
  }
}

export async function atualizarFinanceiro(req: IdParam, res: Response) {
  try {
    const dados = financeiroSchema.parse(req.body);
    const usuario = getUsuario(req);

    const anterior = await prisma.financeiro.findFirst({ where: { processoId: req.params.id, workspaceId: req.workspaceId! } });

    if (anterior && ENTIDADES_SENSIVEIS.includes("Financeiro")) {
      const aprovacao = await criarAprovacao({
        entidade: "Financeiro",
        entidadeId: anterior.id,
        dadosAtuais: anterior,
        dadosPropostos: dados,
        solicitadoPor: usuario,
        workspaceId: req.workspaceId,
      });
      return res.status(202).json({
        message: "Alteração enviada para aprovação",
        aprovacaoId: aprovacao.id,
      });
    }

    const financeiro = await prisma.financeiro.upsert({
      where: { processoId: req.params.id },
      create: {
        processoId: req.params.id,
        workspaceId: req.workspaceId!,
        ...dados,
        prognostico: (dados.prognostico as Prognostico) || "POSSIVEL",
        formaPagamento: (dados.formaPagamento as FormaPagamento) || "A_VISTA",
      },
      update: {
        ...dados,
        prognostico: dados.prognostico as Prognostico | undefined,
        formaPagamento: dados.formaPagamento as FormaPagamento | undefined,
      },
      include: {
        parcelas: { where: { deletadoEm: null }, orderBy: { numero: "asc" } },
      },
    });

    await registrarAuditoria({
      entidade: "Financeiro",
      entidadeId: financeiro.id,
      acao: anterior ? "ATUALIZACAO" : "CRIACAO",
      dadosAnteriores: anterior,
      dadosNovos: financeiro,
      usuario,
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.json(financeiro);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar financeiro" });
  }
}

export async function adicionarParcela(req: IdParam, res: Response) {
  try {
    const dados = parcelaSchema.parse(req.body);

    const financeiro = await prisma.financeiro.findFirst({
      where: { processoId: req.params.id, workspaceId: req.workspaceId! },
    });

    if (!financeiro) {
      return res.status(404).json({ error: "Financeiro não encontrado" });
    }

    const parcela = await prisma.parcela.create({
      data: {
        financeiroId: financeiro.id,
        workspaceId: req.workspaceId!,
        ...dados,
        status: (dados.status as StatusParcela) || "PENDENTE",
      },
    });

    await registrarAuditoria({
      entidade: "Parcela",
      entidadeId: parcela.id,
      acao: "CRIACAO",
      dadosNovos: parcela,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(parcela);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao adicionar parcela" });
  }
}

export async function atualizarParcela(
  req: Request<{ id: string; parcelaId: string }>,
  res: Response
) {
  try {
    const dados = parcelaSchema.partial().parse(req.body);
    const anterior = await prisma.parcela.findFirst({ where: { id: req.params.parcelaId, workspaceId: req.workspaceId! } });

    const parcela = await prisma.parcela.update({
      where: { id: req.params.parcelaId },
      data: {
        ...dados,
        status: dados.status as StatusParcela | undefined,
      },
    });

    await registrarAuditoria({
      entidade: "Parcela",
      entidadeId: parcela.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: parcela,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.json(parcela);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar parcela" });
  }
}

export async function excluirParcela(
  req: Request<{ id: string; parcelaId: string }>,
  res: Response
) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.parcela.findFirst({ where: { id: req.params.parcelaId, workspaceId: req.workspaceId! } });

    await prisma.parcela.update({
      where: { id: req.params.parcelaId },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Parcela",
      entidadeId: req.params.parcelaId,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir parcela" });
  }
}
