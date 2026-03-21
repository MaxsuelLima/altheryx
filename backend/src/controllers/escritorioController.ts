import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const escritorioSchema = z.object({
  nome: z.string().min(2),
  cnpj: z.string().min(14),
  email: z.string().email().nullable().optional(),
  telefone: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().max(2).nullable().optional(),
  cep: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarEscritorios(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;

    const escritorios = await prisma.escritorio.findMany({
      where: {
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cnpj: { contains: busca } },
          ],
        }),
      },
      include: { _count: { select: { advogados: true } } },
      orderBy: { nome: "asc" },
    });

    return res.json(escritorios);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar escritórios" });
  }
}

export async function buscarEscritorio(req: IdParam, res: Response) {
  try {
    const escritorio = await prisma.escritorio.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: { advogados: true },
    });

    if (!escritorio) return res.status(404).json({ error: "Escritório não encontrado" });
    return res.json(escritorio);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar escritório" });
  }
}

export async function criarEscritorio(req: Request, res: Response) {
  try {
    const dados = escritorioSchema.parse(req.body);
    const escritorio = await prisma.escritorio.create({ data: { ...dados, workspaceId: req.workspaceId! } });

    return res.status(201).json(escritorio);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar escritório" });
  }
}

export async function atualizarEscritorio(req: IdParam, res: Response) {
  try {
    const dados = escritorioSchema.partial().parse(req.body);

    const escritorio = await prisma.escritorio.update({
      where: { id: req.params.id },
      data: dados,
    });

    return res.json(escritorio);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar escritório" });
  }
}

export async function excluirEscritorio(req: IdParam, res: Response) {
  try {
    await prisma.escritorio.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: req.user?.userName || "sistema" },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir escritório" });
  }
}
