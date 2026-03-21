import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario, getWorkspaceId } from "../lib/auditService";

const advogadoSchema = z.object({
  nome: z.string().min(2),
  oab: z.string().min(4),
  email: z.string().email().nullable().optional(),
  telefone: z.string().nullable().optional(),
  especialidade: z.string().nullable().optional(),
  escritorioId: z.string().uuid().nullable().optional(),
  ativo: z.boolean().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarAdvogados(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;

    const advogados = await prisma.advogado.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { oab: { contains: busca, mode: "insensitive" } },
          ],
        }),
      },
      include: { escritorio: { select: { id: true, nome: true } } },
      orderBy: { nome: "asc" },
    });

    return res.json(advogados);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar advogados" });
  }
}

export async function buscarAdvogado(req: IdParam, res: Response) {
  try {
    const advogado = await prisma.advogado.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: {
        escritorio: true,
        processos: { select: { id: true, numeroProcesso: true, status: true } },
      },
    });

    if (!advogado || advogado.deletadoEm) return res.status(404).json({ error: "Advogado não encontrado" });
    return res.json(advogado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar advogado" });
  }
}

export async function criarAdvogado(req: Request, res: Response) {
  try {
    const dados = advogadoSchema.parse(req.body);
    const advogado = await prisma.advogado.create({
      data: { ...dados, workspaceId: req.workspaceId! },
      include: { escritorio: { select: { id: true, nome: true } } },
    });

    await registrarAuditoria({
      entidade: "Advogado",
      entidadeId: advogado.id,
      acao: "CRIACAO",
      dadosNovos: advogado,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(advogado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar advogado" });
  }
}

export async function atualizarAdvogado(req: IdParam, res: Response) {
  try {
    const dados = advogadoSchema.partial().parse(req.body);
    const anterior = await prisma.advogado.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    const advogado = await prisma.advogado.update({
      where: { id: req.params.id },
      data: dados,
      include: { escritorio: { select: { id: true, nome: true } } },
    });

    await registrarAuditoria({
      entidade: "Advogado",
      entidadeId: advogado.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: advogado,
      usuario: getUsuario(req),
      workspaceId: req.workspaceId,
    });

    return res.json(advogado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar advogado" });
  }
}

export async function excluirAdvogado(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.advogado.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    await prisma.advogado.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Advogado",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir advogado" });
  }
}
