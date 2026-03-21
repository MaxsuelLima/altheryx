import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { TipoPrazo, StatusPrazo } from "@prisma/client";
import { registrarAuditoria, getUsuario } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const prazoSchema = z.object({
  processoId: z.string().uuid(),
  publicacaoId: z.string().uuid().nullable().optional(),
  tipo: z.enum(["AUDIENCIA", "PRAZO_PROCESSUAL", "PERICIA", "SUSTENTACAO_ORAL", "OUTRO"]),
  descricao: z.string().min(3),
  dataInicio: z.string().transform((s) => new Date(s)),
  dataFim: z.string().transform((s) => new Date(s)),
  horaInicio: z.string().nullable().optional(),
  horaFim: z.string().nullable().optional(),
  local: z.string().nullable().optional(),
  status: z.enum(["PENDENTE", "CUMPRIDO", "PERDIDO"]).optional(),
  observacoes: z.string().nullable().optional(),
  prepostoNome: z.string().nullable().optional(),
  prepostoContato: z.string().nullable().optional(),
  testemunhaIds: z.array(z.string().uuid()).optional(),
});

export async function listarPrazos(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const tipo = req.query.tipo as string | undefined;
    const mes = req.query.mes as string | undefined;
    const ano = req.query.ano as string | undefined;

    let dateFilter = {};
    if (mes && ano) {
      const inicio = new Date(Number(ano), Number(mes) - 1, 1);
      const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
      dateFilter = { dataInicio: { gte: inicio, lte: fim } };
    }

    const prazos = await prisma.prazo.findMany({
      where: {
        deletadoEm: null,
        ...(status && { status: status as StatusPrazo }),
        ...(tipo && { tipo: tipo as TipoPrazo }),
        ...dateFilter,
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true, assunto: true } },
        testemunhas: { include: { testemunha: true } },
      },
      orderBy: { dataInicio: "asc" },
    });

    return res.json(prazos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar prazos" });
  }
}

export async function buscarPrazo(req: IdParam, res: Response) {
  try {
    const prazo = await prisma.prazo.findUnique({
      where: { id: req.params.id },
      include: {
        processo: { select: { id: true, numeroProcesso: true, assunto: true } },
        testemunhas: { include: { testemunha: true } },
      },
    });

    if (!prazo || prazo.deletadoEm) return res.status(404).json({ error: "Prazo não encontrado" });
    return res.json(prazo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar prazo" });
  }
}

export async function criarPrazo(req: Request, res: Response) {
  try {
    const { testemunhaIds, ...dados } = prazoSchema.parse(req.body);

    const prazo = await prisma.prazo.create({
      data: {
        ...dados,
        tipo: dados.tipo as TipoPrazo,
        status: (dados.status as StatusPrazo) || "PENDENTE",
        publicacaoId: dados.publicacaoId ?? undefined,
        testemunhas: testemunhaIds?.length
          ? { create: testemunhaIds.map((tid) => ({ testemunhaId: tid })) }
          : undefined,
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true, assunto: true } },
        testemunhas: { include: { testemunha: true } },
      },
    });

    await registrarAuditoria({
      entidade: "Prazo",
      entidadeId: prazo.id,
      acao: "CRIACAO",
      dadosNovos: prazo,
      usuario: getUsuario(req),
    });

    return res.status(201).json(prazo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar prazo" });
  }
}

export async function atualizarPrazo(req: IdParam, res: Response) {
  try {
    const { testemunhaIds, ...dados } = prazoSchema.partial().parse(req.body);
    const anterior = await prisma.prazo.findUnique({ where: { id: req.params.id } });

    if (testemunhaIds !== undefined) {
      await prisma.prazoTestemunha.deleteMany({ where: { prazoId: req.params.id } });
      if (testemunhaIds.length > 0) {
        await prisma.prazoTestemunha.createMany({
          data: testemunhaIds.map((tid) => ({ prazoId: req.params.id, testemunhaId: tid })),
        });
      }
    }

    const prazo = await prisma.prazo.update({
      where: { id: req.params.id },
      data: {
        ...dados,
        tipo: dados.tipo as TipoPrazo | undefined,
        status: dados.status as StatusPrazo | undefined,
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true, assunto: true } },
        testemunhas: { include: { testemunha: true } },
      },
    });

    await registrarAuditoria({
      entidade: "Prazo",
      entidadeId: prazo.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: prazo,
      usuario: getUsuario(req),
    });

    return res.json(prazo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar prazo" });
  }
}

export async function excluirPrazo(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.prazo.findUnique({ where: { id: req.params.id } });

    await prisma.prazo.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Prazo",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir prazo" });
  }
}

export async function marcarStatus(req: IdParam, res: Response) {
  try {
    const { status } = z.object({ status: z.enum(["PENDENTE", "CUMPRIDO", "PERDIDO"]) }).parse(req.body);
    const anterior = await prisma.prazo.findUnique({ where: { id: req.params.id } });

    const prazo = await prisma.prazo.update({
      where: { id: req.params.id },
      data: { status: status as StatusPrazo },
    });

    await registrarAuditoria({
      entidade: "Prazo",
      entidadeId: prazo.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: { status: anterior?.status },
      dadosNovos: { status: prazo.status },
      usuario: getUsuario(req),
    });

    return res.json(prazo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar status" });
  }
}
