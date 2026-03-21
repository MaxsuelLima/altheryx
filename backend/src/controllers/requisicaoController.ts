import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AreaRequisicao, TipoRequisicao, PrioridadeRequisicao, StatusRequisicao } from "@prisma/client";
import { registrarAuditoria, getUsuario, getWorkspaceId } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const requisicaoSchema = z.object({
  solicitante: z.string().min(2),
  departamento: z.string().min(2),
  area: z.enum(["CONTRATOS", "CONSULTIVO"]),
  tipo: z.enum([
    "ELABORACAO_CONTRATO",
    "AVALIACAO_CONTRATO",
    "PARECER",
    "ADITAMENTO_CONTRATO",
    "RESCISAO_RESOLUCAO",
    "DISTRATO",
    "CONSULTIVO_PREVENTIVO",
    "CONSULTIVO_MATERIAL",
    "CONSULTIVO_OUTROS",
  ]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).optional(),
  titulo: z.string().min(3),
  descricao: z.string().min(5),
  partesEnvolvidas: z.string().nullable().optional(),
  valorEnvolvido: z.number().nullable().optional(),
  prazoDesejado: z
    .string()
    .nullable()
    .optional()
    .transform((s) => (s ? new Date(s) : null)),
});

export async function listarRequisicoes(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;
    const status = req.query.status as string | undefined;
    const area = req.query.area as string | undefined;
    const prioridade = req.query.prioridade as string | undefined;

    const requisicoes = await prisma.requisicao.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { titulo: { contains: busca, mode: "insensitive" } },
            { solicitante: { contains: busca, mode: "insensitive" } },
            { departamento: { contains: busca, mode: "insensitive" } },
            { descricao: { contains: busca, mode: "insensitive" } },
          ],
        }),
        ...(status && { status: status as StatusRequisicao }),
        ...(area && { area: area as AreaRequisicao }),
        ...(prioridade && { prioridade: prioridade as PrioridadeRequisicao }),
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(requisicoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar requisições" });
  }
}

export async function buscarRequisicao(req: IdParam, res: Response) {
  try {
    const requisicao = await prisma.requisicao.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
    });
    if (!requisicao || requisicao.deletadoEm) return res.status(404).json({ error: "Requisição não encontrada" });
    return res.json(requisicao);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar requisição" });
  }
}

export async function criarRequisicao(req: Request, res: Response) {
  try {
    const dados = requisicaoSchema.parse(req.body);
    const requisicao = await prisma.requisicao.create({
      data: {
        ...dados,
        area: dados.area as AreaRequisicao,
        tipo: dados.tipo as TipoRequisicao,
        prioridade: (dados.prioridade as PrioridadeRequisicao) || "MEDIA",
        workspaceId: req.workspaceId!,
      },
    });

    await registrarAuditoria({
      entidade: "Requisicao",
      entidadeId: requisicao.id,
      acao: "CRIACAO",
      dadosNovos: requisicao,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(requisicao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar requisição" });
  }
}

export async function atualizarRequisicao(req: IdParam, res: Response) {
  try {
    const dados = requisicaoSchema.partial().parse(req.body);
    const anterior = await prisma.requisicao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    const extra: Record<string, unknown> = {};
    if (req.body.status) extra.status = req.body.status as StatusRequisicao;
    if (req.body.resposta !== undefined) extra.resposta = req.body.resposta;
    if (req.body.responsavel !== undefined) extra.responsavel = req.body.responsavel;

    if (req.body.status === "CONCLUIDA") {
      extra.concluidaEm = new Date();
    }

    const requisicao = await prisma.requisicao.update({
      where: { id: req.params.id },
      data: {
        ...dados,
        ...(dados.area && { area: dados.area as AreaRequisicao }),
        ...(dados.tipo && { tipo: dados.tipo as TipoRequisicao }),
        ...(dados.prioridade && { prioridade: dados.prioridade as PrioridadeRequisicao }),
        ...extra,
      },
    });

    await registrarAuditoria({
      entidade: "Requisicao",
      entidadeId: requisicao.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: requisicao,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.json(requisicao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar requisição" });
  }
}

export async function excluirRequisicao(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.requisicao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    await prisma.requisicao.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Requisicao",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir requisição" });
  }
}

export async function dashboardRequisicoes(req: Request, res: Response) {
  try {
    const [total, porStatus, porArea, porPrioridade] = await Promise.all([
      prisma.requisicao.count({ where: { deletadoEm: null, workspaceId: req.workspaceId! } }),
      prisma.requisicao.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { deletadoEm: null, workspaceId: req.workspaceId! },
      }),
      prisma.requisicao.groupBy({
        by: ["area"],
        _count: { id: true },
        where: { deletadoEm: null, workspaceId: req.workspaceId! },
      }),
      prisma.requisicao.groupBy({
        by: ["prioridade"],
        where: { deletadoEm: null, workspaceId: req.workspaceId!, status: { in: ["ABERTA", "EM_ANALISE", "EM_ANDAMENTO"] } },
        _count: { id: true },
      }),
    ]);

    return res.json({
      total,
      porStatus: porStatus.map((s) => ({ status: s.status, quantidade: s._count.id })),
      porArea: porArea.map((a) => ({ area: a.area, quantidade: a._count.id })),
      porPrioridade: porPrioridade.map((p) => ({ prioridade: p.prioridade, quantidade: p._count.id })),
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar dashboard" });
  }
}
