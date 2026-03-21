import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { StatusProcuracao, TipoProcuracao } from "@prisma/client";
import { registrarAuditoria, getUsuario, getWorkspaceId } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const procuracaoSchema = z.object({
  processoId: z.string().uuid().nullable().optional(),
  tipoProcuracao: z.enum(["OUTORGADA", "SUBSTABELECIMENTO_COM_RESERVA", "SUBSTABELECIMENTO_SEM_RESERVA"]).optional(),
  outorgante: z.string().min(2),
  outorgado: z.string().min(2),
  poderes: z.string().min(3),
  dataEmissao: z.string().transform((s) => new Date(s)),
  dataValidade: z
    .string()
    .nullable()
    .optional()
    .transform((s) => (s ? new Date(s) : null)),
  status: z.enum(["VIGENTE", "VENCIDA", "REVOGADA"]).optional(),
  observacoes: z.string().nullable().optional(),
});

export async function listarProcuracoes(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;
    const status = req.query.status as string | undefined;

    const procuracoes = await prisma.procuracao.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { outorgante: { contains: busca, mode: "insensitive" } },
            { outorgado: { contains: busca, mode: "insensitive" } },
            { poderes: { contains: busca, mode: "insensitive" } },
          ],
        }),
        ...(status && { status: status as StatusProcuracao }),
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true } },
      },
      orderBy: { dataEmissao: "desc" },
    });

    return res.json(procuracoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar procurações" });
  }
}

export async function buscarProcuracao(req: IdParam, res: Response) {
  try {
    const procuracao = await prisma.procuracao.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: { processo: { select: { id: true, numeroProcesso: true } } },
    });
    if (!procuracao || procuracao.deletadoEm) return res.status(404).json({ error: "Procuração não encontrada" });
    return res.json(procuracao);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar procuração" });
  }
}

export async function criarProcuracao(req: Request, res: Response) {
  try {
    const dados = procuracaoSchema.parse(req.body);
    const procuracao = await prisma.procuracao.create({
      data: {
        ...dados,
        tipoProcuracao: (dados.tipoProcuracao as TipoProcuracao) || "OUTORGADA",
        status: (dados.status as StatusProcuracao) || "VIGENTE",
        workspaceId: req.workspaceId!,
      },
      include: { processo: { select: { id: true, numeroProcesso: true } } },
    });

    await registrarAuditoria({
      entidade: "Procuracao",
      entidadeId: procuracao.id,
      acao: "CRIACAO",
      dadosNovos: procuracao,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(procuracao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar procuração" });
  }
}

export async function atualizarProcuracao(req: IdParam, res: Response) {
  try {
    const dados = procuracaoSchema.partial().parse(req.body);
    const anterior = await prisma.procuracao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    const procuracao = await prisma.procuracao.update({
      where: { id: req.params.id },
      data: {
        ...dados,
        tipoProcuracao: dados.tipoProcuracao as TipoProcuracao | undefined,
        status: dados.status as StatusProcuracao | undefined,
      },
      include: { processo: { select: { id: true, numeroProcesso: true } } },
    });

    await registrarAuditoria({
      entidade: "Procuracao",
      entidadeId: procuracao.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: procuracao,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.json(procuracao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar procuração" });
  }
}

export async function excluirProcuracao(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.procuracao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    await prisma.procuracao.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Procuracao",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir procuração" });
  }
}

export async function alertasRenovacao(req: Request, res: Response) {
  try {
    const hoje = new Date();
    const em30dias = new Date();
    em30dias.setDate(em30dias.getDate() + 30);

    const alertas = await prisma.procuracao.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        status: "VIGENTE",
        dataValidade: { not: null, lte: em30dias },
      },
      include: { processo: { select: { id: true, numeroProcesso: true } } },
      orderBy: { dataValidade: "asc" },
    });

    const resultado = alertas.map((p) => ({
      ...p,
      diasRestantes: p.dataValidade
        ? Math.ceil((p.dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      vencida: p.dataValidade ? p.dataValidade < hoje : false,
    }));

    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar alertas" });
  }
}
