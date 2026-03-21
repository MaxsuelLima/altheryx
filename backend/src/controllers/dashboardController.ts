import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getDashboard(_req: Request, res: Response) {
  try {
    const [
      totalClientes,
      totalAdvogados,
      totalProcessos,
      totalEscritorios,
      totalJuizes,
      totalTestemunhas,
      processosPorStatus,
      processosPorCompetencia,
      processosPorTribunal,
    ] = await Promise.all([
      prisma.cliente.count({ where: { ativo: true, deletadoEm: null } }),
      prisma.advogado.count({ where: { ativo: true, deletadoEm: null } }),
      prisma.processo.count({ where: { deletadoEm: null } }),
      prisma.escritorio.count({ where: { ativo: true, deletadoEm: null } }),
      prisma.juiz.count({ where: { ativo: true, deletadoEm: null } }),
      prisma.testemunha.count({ where: { deletadoEm: null } }),
      prisma.processo.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { deletadoEm: null },
      }),
      prisma.processo.groupBy({
        by: ["competencia"],
        _count: { id: true },
        where: { competencia: { not: null }, deletadoEm: null },
      }),
      prisma.processo.groupBy({
        by: ["tribunal"],
        _count: { id: true },
        where: { deletadoEm: null },
      }),
    ]);

    return res.json({
      totais: {
        clientes: totalClientes,
        advogados: totalAdvogados,
        processos: totalProcessos,
        escritorios: totalEscritorios,
        juizes: totalJuizes,
        testemunhas: totalTestemunhas,
      },
      processosPorStatus: processosPorStatus.map((item) => ({
        status: item.status,
        quantidade: item._count.id,
      })),
      processosPorCompetencia: processosPorCompetencia.map((item) => ({
        competencia: item.competencia,
        quantidade: item._count.id,
      })),
      processosPorTribunal: processosPorTribunal.map((item) => ({
        tribunal: item.tribunal,
        quantidade: item._count.id,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard" });
  }
}
