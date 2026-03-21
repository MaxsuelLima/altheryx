import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AcaoAuditoria } from "@prisma/client";

export async function listarAuditorias(req: Request, res: Response) {
  try {
    const entidade = req.query.entidade as string | undefined;
    const entidadeId = req.query.entidadeId as string | undefined;
    const acao = req.query.acao as string | undefined;
    const usuario = req.query.usuario as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;
    const limite = Number(req.query.limite) || 50;

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entidade && { entidade }),
        ...(entidadeId && { entidadeId }),
        ...(acao && { acao: acao as AcaoAuditoria }),
        ...(usuario && { usuario: { contains: usuario, mode: "insensitive" as const } }),
        ...(dataInicio &&
          dataFim && {
            criadoEm: {
              gte: new Date(dataInicio),
              lte: new Date(dataFim + "T23:59:59"),
            },
          }),
      },
      orderBy: { criadoEm: "desc" },
      take: limite,
    });

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar auditoria" });
  }
}

export async function buscarAuditoria(req: Request<{ id: string }>, res: Response) {
  try {
    const log = await prisma.auditLog.findUnique({
      where: { id: req.params.id },
    });
    if (!log) return res.status(404).json({ error: "Log não encontrado" });
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar log" });
  }
}

export async function historicoEntidade(req: Request<{ entidade: string; entidadeId: string }>, res: Response) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entidade: req.params.entidade,
        entidadeId: req.params.entidadeId,
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar histórico" });
  }
}
