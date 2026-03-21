import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario } from "../lib/auditService";

const prepostoSchema = z.object({
  nome: z.string().min(2),
  cpf: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  telefone: z.string().nullable().optional(),
  empresa: z.string().nullable().optional(),
  cargo: z.string().nullable().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarPrepostos(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;

    const prepostos = await prisma.preposto.findMany({
      where: {
        deletadoEm: null,
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cpf: { contains: busca } },
            { empresa: { contains: busca, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: { select: { processos: true } },
      },
      orderBy: { nome: "asc" },
    });

    return res.json(prepostos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar prepostos" });
  }
}

export async function buscarPreposto(req: IdParam, res: Response) {
  try {
    const preposto = await prisma.preposto.findUnique({
      where: { id: req.params.id },
      include: {
        processos: { include: { processo: { select: { id: true, numeroProcesso: true, assunto: true } } } },
      },
    });

    if (!preposto || preposto.deletadoEm) return res.status(404).json({ error: "Preposto não encontrado" });
    return res.json(preposto);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar preposto" });
  }
}

export async function criarPreposto(req: Request, res: Response) {
  try {
    const dados = prepostoSchema.parse(req.body);
    const preposto = await prisma.preposto.create({ data: dados });

    await registrarAuditoria({
      entidade: "Preposto",
      entidadeId: preposto.id,
      acao: "CRIACAO",
      dadosNovos: preposto,
      usuario: getUsuario(req),
    });

    return res.status(201).json(preposto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar preposto" });
  }
}

export async function atualizarPreposto(req: IdParam, res: Response) {
  try {
    const dados = prepostoSchema.partial().parse(req.body);
    const anterior = await prisma.preposto.findUnique({ where: { id: req.params.id } });

    const preposto = await prisma.preposto.update({
      where: { id: req.params.id },
      data: dados,
    });

    await registrarAuditoria({
      entidade: "Preposto",
      entidadeId: preposto.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: preposto,
      usuario: getUsuario(req),
    });

    return res.json(preposto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar preposto" });
  }
}

export async function excluirPreposto(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.preposto.findUnique({ where: { id: req.params.id } });

    await prisma.preposto.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Preposto",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir preposto" });
  }
}
