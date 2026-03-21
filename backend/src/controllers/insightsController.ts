import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function getInsights(req: Request, res: Response) {
  try {
    const agora = new Date();
    const ha30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ha60d = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalClientes,
      clientesNovosUltimo30d,
      clientesPerdidos30d,
      totalProcessos,
      financeiros,
      parcelasPagas,
      parcelasPendentes,
      processosPorCompetencia,
      processosEncerrados,
    ] = await Promise.all([
      prisma.cliente.count({ where: { workspaceId: req.workspaceId!, ativo: true, deletadoEm: null } }),
      prisma.cliente.count({
        where: { workspaceId: req.workspaceId!, ativo: true, deletadoEm: null, criadoEm: { gte: ha30d } },
      }),
      prisma.cliente.count({
        where: { workspaceId: req.workspaceId!, deletadoEm: { not: null, gte: ha30d } },
      }),
      prisma.processo.count({ where: { workspaceId: req.workspaceId!, deletadoEm: null } }),
      prisma.financeiro.findMany({
        where: { workspaceId: req.workspaceId!, deletadoEm: null },
        select: {
          honorariosContrato: true,
          honorariosExito: true,
          prognostico: true,
          processo: { select: { assunto: true, competencia: true, status: true } },
          parcelas: {
            where: { deletadoEm: null },
            select: { valor: true, status: true },
          },
        },
      }),
      prisma.parcela.aggregate({
        where: { workspaceId: req.workspaceId!, status: "PAGA", deletadoEm: null },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.parcela.aggregate({
        where: { workspaceId: req.workspaceId!, status: { in: ["PENDENTE", "ATRASADA"] }, deletadoEm: null },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.processo.groupBy({
        by: ["competencia"],
        _count: { id: true },
        _avg: { valorCausa: true },
        where: { workspaceId: req.workspaceId!, competencia: { not: null }, deletadoEm: null },
      }),
      prisma.processo.findMany({
        where: { workspaceId: req.workspaceId!, deletadoEm: null, status: "ENCERRADO" },
        select: { competencia: true, comarca: true, criadoEm: true, atualizadoEm: true },
      }),
    ]);

    const toNum = (d: Decimal | null | undefined) => (d ? Number(d) : 0);

    const receitaTotal = financeiros.reduce((acc, f) => {
      return acc + toNum(f.honorariosContrato) + toNum(f.honorariosExito);
    }, 0);

    const receitaRecorrente = financeiros.reduce((acc, f) => {
      const pagas = f.parcelas
        .filter((p) => p.status === "PAGA")
        .reduce((s, p) => s + toNum(p.valor), 0);
      return acc + pagas;
    }, 0);

    const mrr = receitaRecorrente > 0 ? receitaRecorrente / 12 : 0;
    const ltv = totalClientes > 0 ? receitaTotal / totalClientes : 0;
    const cac = clientesNovosUltimo30d > 0 ? receitaTotal * 0.15 / clientesNovosUltimo30d : 0;

    const clientesInicio30d = totalClientes - clientesNovosUltimo30d + clientesPerdidos30d;
    const churn = clientesInicio30d > 0
      ? Math.round((clientesPerdidos30d / clientesInicio30d) * 10000) / 100
      : 0;

    const honorariosPorCompetencia = processosPorCompetencia.map((item) => {
      const processosComp = financeiros.filter(
        (f) => f.processo.competencia === item.competencia
      );
      const totalHonorarios = processosComp.reduce(
        (acc, f) => acc + toNum(f.honorariosContrato),
        0
      );
      const media = processosComp.length > 0 ? totalHonorarios / processosComp.length : 0;

      return {
        competencia: item.competencia,
        totalProcessos: item._count.id,
        valorCausaMedio: toNum(item._avg.valorCausa),
        honorarioMedio: media,
      };
    });

    const prognosticoDistribuicao = {
      provavel: financeiros.filter((f) => f.prognostico === "PROVAVEL").length,
      possivel: financeiros.filter((f) => f.prognostico === "POSSIVEL").length,
      remota: financeiros.filter((f) => f.prognostico === "REMOTA").length,
    };

    const duracaoAgrupada: Record<string, { total: number; soma: number }> = {};
    for (const p of processosEncerrados) {
      const dias = Math.ceil((p.atualizadoEm.getTime() - p.criadoEm.getTime()) / (1000 * 60 * 60 * 24));
      const chave = p.competencia || "Geral";
      if (!duracaoAgrupada[chave]) duracaoAgrupada[chave] = { total: 0, soma: 0 };
      duracaoAgrupada[chave].total++;
      duracaoAgrupada[chave].soma += dias;
    }

    const duracaoMedia = Object.entries(duracaoAgrupada).map(([competencia, val]) => ({
      competencia,
      totalEncerrados: val.total,
      mediaDias: Math.round(val.soma / val.total),
      mediaMeses: Math.round((val.soma / val.total / 30) * 10) / 10,
    }));

    return res.json({
      kpis: {
        mrr: Math.round(mrr * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        cac: Math.round(cac * 100) / 100,
        churn,
        receitaTotal: Math.round(receitaTotal * 100) / 100,
        totalRecebido: toNum(parcelasPagas._sum.valor),
        totalPendente: toNum(parcelasPendentes._sum.valor),
        parcelasPagas: parcelasPagas._count,
        parcelasPendentes: parcelasPendentes._count,
        totalClientes,
        totalProcessos,
        clientesNovos30d: clientesNovosUltimo30d,
        clientesPerdidos30d,
      },
      honorariosPorCompetencia,
      prognosticoDistribuicao,
      duracaoMedia,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar insights" });
  }
}
