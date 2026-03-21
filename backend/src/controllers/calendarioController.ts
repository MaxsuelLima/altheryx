import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario, getWorkspaceId } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const calendarioSchema = z.object({
  tribunal: z.string().min(2),
  descricao: z.string().min(3),
  dataInicio: z.string().transform((s) => new Date(s)),
  dataFim: z.string().transform((s) => new Date(s)),
  tipo: z.string().min(2),
});

export async function listarEventos(req: Request, res: Response) {
  try {
    const tribunal = req.query.tribunal as string | undefined;
    const mes = req.query.mes as string | undefined;
    const ano = req.query.ano as string | undefined;

    let dateFilter = {};
    if (mes && ano) {
      const inicio = new Date(Number(ano), Number(mes) - 1, 1);
      const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
      dateFilter = {
        OR: [
          { dataInicio: { gte: inicio, lte: fim } },
          { dataFim: { gte: inicio, lte: fim } },
          { AND: [{ dataInicio: { lte: inicio } }, { dataFim: { gte: fim } }] },
        ],
      };
    }

    const eventos = await prisma.calendarioTribunal.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        ...(tribunal && { tribunal: { contains: tribunal, mode: "insensitive" as const } }),
        ...dateFilter,
      },
      orderBy: { dataInicio: "asc" },
    });

    return res.json(eventos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar eventos" });
  }
}

export async function criarEvento(req: Request, res: Response) {
  try {
    const dados = calendarioSchema.parse(req.body);
    const evento = await prisma.calendarioTribunal.create({ data: { ...dados, workspaceId: req.workspaceId! } });

    await registrarAuditoria({
      entidade: "CalendarioTribunal",
      entidadeId: evento.id,
      acao: "CRIACAO",
      dadosNovos: evento,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(evento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar evento" });
  }
}

export async function atualizarEvento(req: IdParam, res: Response) {
  try {
    const dados = calendarioSchema.partial().parse(req.body);
    const anterior = await prisma.calendarioTribunal.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    const evento = await prisma.calendarioTribunal.update({
      where: { id: req.params.id },
      data: dados,
    });

    await registrarAuditoria({
      entidade: "CalendarioTribunal",
      entidadeId: evento.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: evento,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.json(evento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar evento" });
  }
}

export async function excluirEvento(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.calendarioTribunal.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    await prisma.calendarioTribunal.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "CalendarioTribunal",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir evento" });
  }
}

export async function listarTribunais(req: Request, res: Response) {
  try {
    const tribunais = await prisma.calendarioTribunal.findMany({
      select: { tribunal: true },
      distinct: ["tribunal"],
      where: { deletadoEm: null, workspaceId: req.workspaceId! },
      orderBy: { tribunal: "asc" },
    });
    return res.json(tribunais.map((t) => t.tribunal));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar tribunais" });
  }
}
