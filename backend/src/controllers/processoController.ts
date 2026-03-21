import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { FaseProcessual } from "@prisma/client";
import { registrarAuditoria, getUsuario, criarAprovacao, ENTIDADES_SENSIVEIS, getIp } from "../lib/auditService";
import { detectarFase, calcularCorrecaoMonetaria, INDICES_DISPONIVEIS } from "../lib/faseProcessual";

type IdParam = Request<{ id: string }>;

const processoSchema = z.object({
  numeroProcesso: z.string().min(5),
  status: z.enum(["EM_ANDAMENTO", "SUSPENSO", "ARQUIVADO", "ENCERRADO", "AGUARDANDO_JULGAMENTO"]).optional(),
  tribunal: z.string().min(2),
  competencia: z.string().nullable().optional(),
  comarca: z.string().nullable().optional(),
  assunto: z.string().min(2),
  fase: z.enum(["CONHECIMENTO", "INSTRUCAO", "JULGAMENTO", "RECURSAL", "EXECUCAO", "CUMPRIMENTO_SENTENCA", "ENCERRADO"]).nullable().optional(),
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
        workspaceId: req.workspaceId!,
        deletadoEm: null,
        ...(busca && {
          OR: [
            { numeroProcesso: { contains: busca } },
            { assunto: { contains: busca, mode: "insensitive" } },
            { tribunal: { contains: busca, mode: "insensitive" } },
            { comarca: { contains: busca, mode: "insensitive" } },
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
    const processo = await prisma.processo.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: {
        advogado: true,
        juiz: true,
        partes: { include: { cliente: true }, orderBy: { criadoEm: "asc" } },
        testemunhas: { include: { testemunha: true } },
        peritos: { include: { perito: true } },
        prepostos: { include: { preposto: true } },
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
        workspaceId: req.workspaceId!,
        valorCausa: dados.valorCausa ?? undefined,
        fase: (dados.fase as FaseProcessual) || "CONHECIMENTO",
      },
    });

    await registrarAuditoria({
      entidade: "Processo",
      entidadeId: processo.id,
      acao: "CRIACAO",
      dadosNovos: processo,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
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
    const anterior = await prisma.processo.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

    if (!anterior) return res.status(404).json({ error: "Processo não encontrado" });

    if (ENTIDADES_SENSIVEIS.includes("Processo")) {
      const aprovacao = await criarAprovacao({
        entidade: "Processo",
        entidadeId: req.params.id,
        dadosAtuais: anterior,
        dadosPropostos: dados,
        solicitadoPor: usuario,
        workspaceId: req.workspaceId,
      });
      return res.status(202).json({
        message: "Alteração enviada para aprovação",
        aprovacaoId: aprovacao.id,
      });
    }

    const processo = await prisma.processo.update({
      where: { id: req.params.id },
      data: {
        ...dados,
        valorCausa: dados.valorCausa ?? undefined,
        fase: dados.fase as FaseProcessual | undefined,
      },
    });

    await registrarAuditoria({
      entidade: "Processo",
      entidadeId: processo.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: processo,
      usuario,
      ip: getIp(req),
      workspaceId: req.workspaceId,
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
    const anterior = await prisma.processo.findFirst({ where: { id: req.params.id, workspaceId: req.workspaceId! } });

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
      ip: getIp(req),
      workspaceId: req.workspaceId,
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
        workspaceId: req.workspaceId!,
        ...dados,
      },
    });

    const faseDetectada = detectarFase(dados.descricao);
    await prisma.processo.update({
      where: { id: req.params.id },
      data: {
        ultimaMovimentacao: dados.data,
        ...(faseDetectada && { fase: faseDetectada }),
      },
    });

    await registrarAuditoria({
      entidade: "Movimentacao",
      entidadeId: movimentacao.id,
      acao: "CRIACAO",
      dadosNovos: { ...movimentacao, faseDetectada },
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json({ ...movimentacao, faseDetectada });
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
    const anterior = await prisma.movimentacao.findFirst({ where: { id: req.params.movId, workspaceId: req.workspaceId! } });

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
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir movimentação" });
  }
}

const parteSchema = z.object({
  clienteId: z.string().uuid(),
  tipoParte: z.enum(["AUTOR", "REU", "TERCEIRO_INTERESSADO", "ASSISTENTE", "AMICUS_CURIAE"]),
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

export async function adicionarPerito(req: IdParam, res: Response) {
  try {
    const { peritoId } = z.object({ peritoId: z.string().uuid() }).parse(req.body);
    const vinculo = await prisma.processoPerito.create({
      data: { processoId: req.params.id, peritoId },
      include: { perito: true },
    });
    return res.status(201).json(vinculo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao vincular perito" });
  }
}

export async function removerPerito(req: Request<{ id: string; peritoId: string }>, res: Response) {
  try {
    await prisma.processoPerito.delete({
      where: { processoId_peritoId: { processoId: req.params.id, peritoId: req.params.peritoId } },
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover perito" });
  }
}

export async function adicionarPreposto(req: IdParam, res: Response) {
  try {
    const { prepostoId } = z.object({ prepostoId: z.string().uuid() }).parse(req.body);
    const vinculo = await prisma.processoPreposto.create({
      data: { processoId: req.params.id, prepostoId },
      include: { preposto: true },
    });
    return res.status(201).json(vinculo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao vincular preposto" });
  }
}

export async function removerPreposto(req: Request<{ id: string; prepostoId: string }>, res: Response) {
  try {
    await prisma.processoPreposto.delete({
      where: { processoId_prepostoId: { processoId: req.params.id, prepostoId: req.params.prepostoId } },
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover preposto" });
  }
}

export async function duracaoMedia(req: Request, res: Response) {
  try {
    const encerrados = await prisma.processo.findMany({
      where: { workspaceId: req.workspaceId!, deletadoEm: null, status: "ENCERRADO" },
      select: { competencia: true, comarca: true, criadoEm: true, atualizadoEm: true },
    });

    const agrupado: Record<string, { total: number; soma: number }> = {};

    for (const p of encerrados) {
      const dias = Math.ceil((p.atualizadoEm.getTime() - p.criadoEm.getTime()) / (1000 * 60 * 60 * 24));
      const chave = `${p.competencia || "Geral"}|${p.comarca || "Geral"}`;
      if (!agrupado[chave]) agrupado[chave] = { total: 0, soma: 0 };
      agrupado[chave].total++;
      agrupado[chave].soma += dias;
    }

    const resultado = Object.entries(agrupado).map(([chave, val]) => {
      const [competencia, comarca] = chave.split("|");
      return {
        competencia,
        comarca,
        totalProcessos: val.total,
        duracaoMediaDias: Math.round(val.soma / val.total),
        duracaoMediaMeses: Math.round((val.soma / val.total / 30) * 10) / 10,
      };
    });

    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao calcular duração média" });
  }
}

export async function correcaoMonetaria(req: Request, res: Response) {
  try {
    const { valor, indice, meses } = z.object({
      valor: z.number().positive(),
      indice: z.string(),
      meses: z.number().int().positive(),
    }).parse(req.body);

    const resultado = calcularCorrecaoMonetaria(valor, indice, meses);
    return res.json({ ...resultado, valorOriginal: valor, indice, meses, indicesDisponiveis: INDICES_DISPONIVEIS });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao calcular correção monetária" });
  }
}
