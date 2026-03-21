import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusProcesso, Prognostico, StatusParcela, StatusPrazo, StatusRequisicao } from "@prisma/client";

export async function relatorioProcessos(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const tribunal = req.query.tribunal as string | undefined;
    const competencia = req.query.competencia as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;
    const advogadoId = req.query.advogadoId as string | undefined;

    const processos = await prisma.processo.findMany({
      where: {
        deletadoEm: null,
        ...(status && { status: status as StatusProcesso }),
        ...(tribunal && { tribunal: { contains: tribunal, mode: "insensitive" as const } }),
        ...(competencia && { competencia: { contains: competencia, mode: "insensitive" as const } }),
        ...(advogadoId && { advogadoId }),
        ...(dataInicio &&
          dataFim && {
            criadoEm: {
              gte: new Date(dataInicio),
              lte: new Date(dataFim + "T23:59:59"),
            },
          }),
      },
      include: {
        advogado: { select: { nome: true, oab: true } },
        juiz: { select: { nome: true } },
        _count: { select: { partes: true, movimentacoes: true, documentos: true } },
        financeiro: { select: { prognostico: true, honorariosContrato: true, valorCausaEstimado: true } },
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(processos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar relatório de processos" });
  }
}

export async function relatorioClientes(req: Request, res: Response) {
  try {
    const ativo = req.query.ativo as string | undefined;
    const estado = req.query.estado as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;

    const clientes = await prisma.cliente.findMany({
      where: {
        deletadoEm: null,
        ...(ativo !== undefined && { ativo: ativo === "true" }),
        ...(estado && { estado }),
        ...(dataInicio &&
          dataFim && {
            criadoEm: {
              gte: new Date(dataInicio),
              lte: new Date(dataFim + "T23:59:59"),
            },
          }),
      },
      include: {
        _count: { select: { partesProcesso: true } },
      },
      orderBy: { nome: "asc" },
    });

    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar relatório de clientes" });
  }
}

export async function relatorioFinanceiro(req: Request, res: Response) {
  try {
    const prognostico = req.query.prognostico as string | undefined;
    const statusParcela = req.query.statusParcela as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;

    const financeiros = await prisma.financeiro.findMany({
      where: {
        deletadoEm: null,
        ...(prognostico && { prognostico: prognostico as Prognostico }),
      },
      include: {
        processo: {
          select: { id: true, numeroProcesso: true, assunto: true, tribunal: true, status: true },
        },
        parcelas: {
          where: {
            deletadoEm: null,
            ...(statusParcela && { status: statusParcela as StatusParcela }),
            ...(dataInicio &&
              dataFim && {
                dataVencimento: {
                  gte: new Date(dataInicio),
                  lte: new Date(dataFim + "T23:59:59"),
                },
              }),
          },
          orderBy: { dataVencimento: "asc" },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    const toNum = (v: unknown) => (v ? Number(v) : 0);

    const resumo = {
      totalHonorarios: financeiros.reduce((acc, f) => acc + toNum(f.honorariosContrato), 0),
      totalValorCausa: financeiros.reduce((acc, f) => acc + toNum(f.valorCausaEstimado), 0),
      totalParcelas: financeiros.reduce((acc, f) => acc + f.parcelas.length, 0),
      totalPago: financeiros.reduce(
        (acc, f) =>
          acc +
          f.parcelas
            .filter((p) => p.status === "PAGA")
            .reduce((s, p) => s + toNum(p.valor), 0),
        0
      ),
      totalPendente: financeiros.reduce(
        (acc, f) =>
          acc +
          f.parcelas
            .filter((p) => p.status === "PENDENTE" || p.status === "ATRASADA")
            .reduce((s, p) => s + toNum(p.valor), 0),
        0
      ),
    };

    return res.json({ dados: financeiros, resumo });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar relatório financeiro" });
  }
}

export async function relatorioPrazos(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const tipo = req.query.tipo as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;

    const prazos = await prisma.prazo.findMany({
      where: {
        deletadoEm: null,
        ...(status && { status: status as StatusPrazo }),
        ...(tipo && { tipo: tipo as never }),
        ...(dataInicio &&
          dataFim && {
            dataInicio: {
              gte: new Date(dataInicio),
              lte: new Date(dataFim + "T23:59:59"),
            },
          }),
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true, assunto: true } },
        testemunhas: { include: { testemunha: { select: { nome: true } } } },
      },
      orderBy: { dataInicio: "asc" },
    });

    return res.json(prazos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar relatório de prazos" });
  }
}

export async function relatorioProcuracoes(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const vencendo = req.query.vencendo as string | undefined;

    let dateFilter = {};
    if (vencendo === "true") {
      const em30dias = new Date();
      em30dias.setDate(em30dias.getDate() + 30);
      dateFilter = {
        status: "VIGENTE" as const,
        dataValidade: { not: null, lte: em30dias },
      };
    }

    const procuracoes = await prisma.procuracao.findMany({
      where: {
        deletadoEm: null,
        ...(status && !vencendo && { status: status as never }),
        ...dateFilter,
      },
      include: {
        processo: { select: { id: true, numeroProcesso: true } },
      },
      orderBy: { dataEmissao: "desc" },
    });

    return res.json(procuracoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar relatório de procurações" });
  }
}

export async function relatorioRequisicoes(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const area = req.query.area as string | undefined;
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;

    const requisicoes = await prisma.requisicao.findMany({
      where: {
        deletadoEm: null,
        ...(status && { status: status as StatusRequisicao }),
        ...(area && { area: area as never }),
        ...(dataInicio &&
          dataFim && {
            criadoEm: {
              gte: new Date(dataInicio),
              lte: new Date(dataFim + "T23:59:59"),
            },
          }),
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(requisicoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar relatório de requisições" });
  }
}

export async function relatorioFiltros(_req: Request, res: Response) {
  try {
    const [tribunais, competencias, advogados, estados] = await Promise.all([
      prisma.processo.findMany({
        select: { tribunal: true },
        distinct: ["tribunal"],
        where: { deletadoEm: null },
        orderBy: { tribunal: "asc" },
      }),
      prisma.processo.findMany({
        select: { competencia: true },
        distinct: ["competencia"],
        where: { competencia: { not: null }, deletadoEm: null },
        orderBy: { competencia: "asc" },
      }),
      prisma.advogado.findMany({
        select: { id: true, nome: true, oab: true },
        where: { ativo: true, deletadoEm: null },
        orderBy: { nome: "asc" },
      }),
      prisma.cliente.findMany({
        select: { estado: true },
        distinct: ["estado"],
        where: { estado: { not: null }, deletadoEm: null },
        orderBy: { estado: "asc" },
      }),
    ]);

    return res.json({
      tribunais: tribunais.map((t) => t.tribunal),
      competencias: competencias.map((c) => c.competencia).filter(Boolean),
      advogados,
      estados: estados.map((e) => e.estado).filter(Boolean),
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar filtros" });
  }
}
