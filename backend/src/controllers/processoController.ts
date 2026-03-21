import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { registrarAuditoria, getUsuario, criarAprovacao, ENTIDADES_SENSIVEIS } from "../lib/auditService";

type IdParam = Request<{ id: string }>;

const processoSchema = z.object({
  numeroProcesso: z.string().min(5),
  status: z.enum(["EM_ANDAMENTO", "SUSPENSO", "ARQUIVADO", "ENCERRADO", "AGUARDANDO_JULGAMENTO"]).optional(),
  tribunal: z.string().min(2),
  competencia: z.string().nullable().optional(),
  assunto: z.string().min(2),
  valorCausa: z.number().nullable().optional(),
  segredoJustica: z.boolean().optional(),
  tutelaLiminar: z.boolean().optional(),
  observacoes: z.string().nullable().optional(),
  advogadoId: z.string().uuid().nullable().optional(),
  juizId: z.string().uuid().nullable().optional(),
});

export async function listarProcessos(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;
    const status = req.query.status as string | undefined;

    const processos = await prisma.processo.findMany({
      where: {
        deletadoEm: null,
        ...(busca && {
          OR: [
            { numeroProcesso: { contains: busca } },
            { assunto: { contains: busca, mode: "insensitive" } },
            { tribunal: { contains: busca, mode: "insensitive" } },
          ],
        }),
        ...(status && { status: status as never }),
      },
      include: {
        advogado: { select: { id: true, nome: true, oab: true } },
        juiz: { select: { id: true, nome: true } },
        _count: { select: { partes: true, documentos: true, movimentacoes: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(processos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar processos" });
  }
}

export async function buscarProcesso(req: IdParam, res: Response) {
  try {
    const processo = await prisma.processo.findUnique({
      where: { id: req.params.id },
      include: {
        advogado: true,
        juiz: true,
        partes: { include: { cliente: true }, orderBy: { criadoEm: "asc" } },
        testemunhas: { include: { testemunha: true } },
        movimentacoes: { where: { deletadoEm: null }, orderBy: { data: "desc" } },
      },
    });

    if (!processo || processo.deletadoEm) return res.status(404).json({ error: "Processo não encontrado" });
    return res.json(processo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar processo" });
  }
}

export async function criarProcesso(req: Request, res: Response) {
  try {
    const dados = processoSchema.parse(req.body);
    const processo = await prisma.processo.create({
      data: {
        ...dados,
        valorCausa: dados.valorCausa ?? undefined,
      },
    });

    await registrarAuditoria({
      entidade: "Processo",
      entidadeId: processo.id,
      acao: "CRIACAO",
      dadosNovos: processo,
      usuario: getUsuario(req),
    });

    return res.status(201).json(processo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar processo" });
  }
}

export async function atualizarProcesso(req: IdParam, res: Response) {
  try {
    const dados = processoSchema.partial().parse(req.body);
    const usuario = getUsuario(req);
    const anterior = await prisma.processo.findUnique({ where: { id: req.params.id } });

    if (!anterior) return res.status(404).json({ error: "Processo não encontrado" });

    if (ENTIDADES_SENSIVEIS.includes("Processo")) {
      const aprovacao = await criarAprovacao({
        entidade: "Processo",
        entidadeId: req.params.id,
        dadosAtuais: anterior,
        dadosPropostos: dados,
        solicitadoPor: usuario,
      });
      return res.status(202).json({
        message: "Alteração enviada para aprovação",
        aprovacaoId: aprovacao.id,
      });
    }

    const processo = await prisma.processo.update({
      where: { id: req.params.id },
      data: { ...dados, valorCausa: dados.valorCausa ?? undefined },
    });

    await registrarAuditoria({
      entidade: "Processo",
      entidadeId: processo.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: processo,
      usuario,
    });

    return res.json(processo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar processo" });
  }
}

export async function excluirProcesso(req: IdParam, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.processo.findUnique({ where: { id: req.params.id } });

    await prisma.processo.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Processo",
      entidadeId: req.params.id,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir processo" });
  }
}

const movimentacaoSchema = z.object({
  data: z.string().transform((s) => new Date(s)),
  descricao: z.string().min(3),
});

export async function adicionarMovimentacao(req: IdParam, res: Response) {
  try {
    const dados = movimentacaoSchema.parse(req.body);
    const movimentacao = await prisma.movimentacao.create({
      data: {
        processoId: req.params.id,
        ...dados,
      },
    });

    await prisma.processo.update({
      where: { id: req.params.id },
      data: { ultimaMovimentacao: dados.data },
    });

    await registrarAuditoria({
      entidade: "Movimentacao",
      entidadeId: movimentacao.id,
      acao: "CRIACAO",
      dadosNovos: movimentacao,
      usuario: getUsuario(req),
    });

    return res.status(201).json(movimentacao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao adicionar movimentação" });
  }
}

export async function excluirMovimentacao(req: Request<{ id: string; movId: string }>, res: Response) {
  try {
    const usuario = getUsuario(req);
    const anterior = await prisma.movimentacao.findUnique({ where: { id: req.params.movId } });

    await prisma.movimentacao.update({
      where: { id: req.params.movId },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Movimentacao",
      entidadeId: req.params.movId,
      acao: "EXCLUSAO",
      dadosAnteriores: anterior,
      usuario,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir movimentação" });
  }
}

const parteSchema = z.object({
  clienteId: z.string().uuid(),
  tipoParte: z.enum(["AUTOR", "REU", "TERCEIRO_INTERESSADO", "ASSISTENTE"]),
});

export async function adicionarParte(req: IdParam, res: Response) {
  try {
    const dados = parteSchema.parse(req.body);
    const parte = await prisma.parteProcesso.create({
      data: { processoId: req.params.id, ...dados },
      include: { cliente: true },
    });
    return res.status(201).json(parte);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao adicionar parte" });
  }
}

export async function removerParte(req: Request<{ id: string; parteId: string }>, res: Response) {
  try {
    await prisma.parteProcesso.delete({ where: { id: req.params.parteId } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover parte" });
  }
}
