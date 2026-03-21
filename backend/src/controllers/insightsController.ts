import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function getInsights(_req: Request, res: Response) {
  try {
    const [
      totalClientes,
      clientesNovosUltimo30d,
      totalProcessos,
      financeiros,
      parcelasPagas,
      parcelasPendentes,
      processosPorCompetencia,
    ] = await Promise.all([
      prisma.cliente.count({ where: { ativo: true, deletadoEm: null } }),
      prisma.cliente.count({
        where: {
          ativo: true,
          deletadoEm: null,
          criadoEm: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.processo.count({ where: { deletadoEm: null } }),
      prisma.financeiro.findMany({
        where: { deletadoEm: null },
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
        where: { status: "PAGA", deletadoEm: null },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.parcela.aggregate({
        where: { status: { in: ["PENDENTE", "ATRASADA"] }, deletadoEm: null },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.processo.groupBy({
        by: ["competencia"],
        _count: { id: true },
        _avg: { valorCausa: true },
        where: { competencia: { not: null }, deletadoEm: null },
      }),
    ]);

    const toNum = (d: Decimal | null | undefined) => (d ? Number(d) : 0);

    const receitaTotal = financeiros.reduce((acc, f) => {
      const contrato = toNum(f.honorariosContrato);
      const exito = toNum(f.honorariosExito);
      return acc + contrato + exito;
    }, 0);

    const receitaRecorrente = financeiros.reduce((acc, f) => {
      const pagas = f.parcelas
        .filter((p) => p.status === "PAGA")
        .reduce((s, p) => s + toNum(p.valor), 0);
      return acc + pagas;
    }, 0);

    const mrr = receitaRecorrente > 0 ? receitaRecorrente / 12 : 0;

    const ltv = totalClientes > 0 ? receitaTotal / totalClientes : 0;

    const cac = clientesNovosUltimo30d > 0
      ? receitaTotal * 0.15 / clientesNovosUltimo30d
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

    return res.json({
      kpis: {
        mrr: Math.round(mrr * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        cac: Math.round(cac * 100) / 100,
        receitaTotal: Math.round(receitaTotal * 100) / 100,
        totalRecebido: toNum(parcelasPagas._sum.valor),
        totalPendente: toNum(parcelasPendentes._sum.valor),
        parcelasPagas: parcelasPagas._count,
        parcelasPendentes: parcelasPendentes._count,
        totalClientes,
        totalProcessos,
      },
      honorariosPorCompetencia,
      prognosticoDistribuicao,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar insights" });
  }
}
