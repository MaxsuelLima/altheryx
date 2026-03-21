import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario, getWorkspaceId, getIp } from "../lib/auditService";

const testemunhaSchema = z.object({
  nome: z.string().min(2),
  cpf: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  telefone: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  profissao: z.string().nullable().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarTestemunhas(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;

    const testemunhas = await prisma.testemunha.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cpf: { contains: busca } },
          ],
        }),
      },
      orderBy: { nome: "asc" },
    });

    return res.json(testemunhas);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar testemunhas" });
  }
}

export async function buscarTestemunha(req: IdParam, res: Response) {
  try {
    const testemunha = await prisma.testemunha.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: {
        processos: { include: { processo: { select: { id: true, numeroProcesso: true } } } },
      },
    });

    if (!testemunha || testemunha.deletadoEm) return res.status(404).json({ error: "Testemunha não encontrada" });
    return res.json(testemunha);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar testemunha" });
  }
}

export async function criarTestemunha(req: Request, res: Response) {
  try {
    const dados = testemunhaSchema.parse(req.body);
    const testemunha = await prisma.testemunha.create({ data: { ...dados, workspaceId: req.workspaceId! } });

    await registrarAuditoria({
      entidade: "Testemunha",
      entidadeId: testemunha.id,
      acao: "CRIACAO",
      dadosNovos: testemunha,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(testemunha);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar testemunha" });
  }
}

export async function atualizarTestemunha(req: IdParam, res: Response) {
  try {
    const dados = testemunhaSchema.partial().parse(req.body);
    const anterior = await prisma.testemunha.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    const testemunha = await prisma.testemunha.update({
      where: { id: req.params.id },
      data: dados,
    });

    await registrarAuditoria({
      entidade: "Testemunha",
      entidadeId: testemunha.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: testemunha,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.json(testemunha);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar testemunha" });
  }
}

export async function excluirTestemunha(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.testemunha.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    await prisma.testemunha.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Testemunha",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir testemunha" });
  }
}
