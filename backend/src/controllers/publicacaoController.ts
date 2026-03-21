import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario, getWorkspaceId, getIp } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const publicacaoSchema = z.object({
  processoId: z.string().uuid().nullable().optional(),
  palavraChave: z.string().min(2),
  diarioOrigem: z.string().min(2),
  dataPublicacao: z.string().transform((s) => new Date(s)),
  conteudo: z.string().min(3),
});

export async function listarPublicacoes(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;
    const lida = req.query.lida as string | undefined;

    const publicacoes = await prisma.publicacao.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { palavraChave: { contains: busca, mode: "insensitive" } },
            { conteudo: { contains: busca, mode: "insensitive" } },
            { diarioOrigem: { contains: busca, mode: "insensitive" } },
          ],
        }),
        ...(lida !== undefined && { lida: lida === "true" }),
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true } },
      },
      orderBy: { dataPublicacao: "desc" },
    });

    return res.json(publicacoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar publicações" });
  }
}

export async function criarPublicacao(req: Request, res: Response) {
  try {
    const dados = publicacaoSchema.parse(req.body);
    const publicacao = await prisma.publicacao.create({
      data: { ...dados, workspaceId: req.workspaceId! },
      include: { processo: { select: { id: true, numeroProcesso: true } } },
    });

    await registrarAuditoria({
      entidade: "Publicacao",
      entidadeId: publicacao.id,
      acao: "CRIACAO",
      dadosNovos: publicacao,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(publicacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar publicação" });
  }
}

export async function atualizarPublicacao(req: IdParam, res: Response) {
  try {
    const dados = publicacaoSchema.partial().parse(req.body);
    const anterior = await prisma.publicacao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    const publicacao = await prisma.publicacao.update({
      where: { id: req.params.id },
      data: dados,
    });

    await registrarAuditoria({
      entidade: "Publicacao",
      entidadeId: publicacao.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: publicacao,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.json(publicacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar publicação" });
  }
}

export async function marcarLida(req: IdParam, res: Response) {
  try {
    const anterior = await prisma.publicacao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });
    if (!anterior) return res.status(404).json({ error: "Publicação não encontrada" });

    const publicacao = await prisma.publicacao.update({
      where: { id: req.params.id },
      data: { lida: true },
    });
    return res.json(publicacao);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao marcar como lida" });
  }
}

export async function excluirPublicacao(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.publicacao.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    await prisma.publicacao.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Publicacao",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir publicação" });
  }
}

export async function buscarPorPalavraChave(req: Request, res: Response) {
  try {
    const palavra = req.query.palavra as string | undefined;
    if (!palavra || palavra.length < 2) {
      return res.status(400).json({ error: "Palavra-chave deve ter ao menos 2 caracteres" });
    }

    const resultados = await prisma.publicacao.findMany({
      where: {
        deletadoEm: null,
        workspaceId: req.workspaceId!,
        OR: [
          { palavraChave: { contains: palavra, mode: "insensitive" } },
          { conteudo: { contains: palavra, mode: "insensitive" } },
        ],
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true } },
      },
      orderBy: { dataPublicacao: "desc" },
      take: 50,
    });

    return res.json(resultados);
  } catch (error) {
    return res.status(500).json({ error: "Erro na busca" });
  }
}
