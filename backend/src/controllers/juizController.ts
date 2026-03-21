import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const juizSchema = z.object({
  nome: z.string().min(2),
  tribunal: z.string().nullable().optional(),
  vara: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  ativo: z.boolean().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarJuizes(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;

    const juizes = await prisma.juiz.findMany({
      where: {
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { tribunal: { contains: busca, mode: "insensitive" } },
          ],
        }),
      },
      include: { _count: { select: { processos: true } } },
      orderBy: { nome: "asc" },
    });

    return res.json(juizes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar juízes" });
  }
}

export async function buscarJuiz(req: IdParam, res: Response) {
  try {
    const juiz = await prisma.juiz.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: { processos: { select: { id: true, numeroProcesso: true, status: true } } },
    });

    if (!juiz) return res.status(404).json({ error: "Juiz não encontrado" });
    return res.json(juiz);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar juiz" });
  }
}

export async function criarJuiz(req: Request, res: Response) {
  try {
    const dados = juizSchema.parse(req.body);
    const juiz = await prisma.juiz.create({ data: { ...dados, workspaceId: req.workspaceId! } });

    return res.status(201).json(juiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar juiz" });
  }
}

export async function atualizarJuiz(req: IdParam, res: Response) {
  try {
    const dados = juizSchema.partial().parse(req.body);

    const juiz = await prisma.juiz.update({
      where: { id: req.params.id },
      data: dados,
    });

    return res.json(juiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar juiz" });
  }
}

export async function excluirJuiz(req: IdParam, res: Response) {
  try {
    await prisma.juiz.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: req.user?.userName || "sistema" },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir juiz" });
  }
}
