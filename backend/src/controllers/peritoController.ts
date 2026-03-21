import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { TipoPerito } from "@prisma/client";

const peritoSchema = z.object({
  nome: z.string().min(2),
  cpf: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  telefone: z.string().nullable().optional(),
  tipo: z.enum(["PERITO", "ASSISTENTE_TECNICO"]).optional(),
  especialidade: z.string().nullable().optional(),
  registroProfissional: z.string().nullable().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarPeritos(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;
    const tipo = req.query.tipo as string | undefined;

    const peritos = await prisma.perito.findMany({
      where: {
        workspaceId: req.workspaceId!,
        ...(tipo && { tipo: tipo as TipoPerito }),
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cpf: { contains: busca } },
            { especialidade: { contains: busca, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: { select: { processos: true } },
      },
      orderBy: { nome: "asc" },
    });

    return res.json(peritos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar peritos" });
  }
}

export async function buscarPerito(req: IdParam, res: Response) {
  try {
    const perito = await prisma.perito.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: {
        processos: { include: { processo: { select: { id: true, numeroProcesso: true, assunto: true } } } },
      },
    });

    if (!perito) return res.status(404).json({ error: "Perito não encontrado" });
    return res.json(perito);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar perito" });
  }
}

export async function criarPerito(req: Request, res: Response) {
  try {
    const dados = peritoSchema.parse(req.body);
    const perito = await prisma.perito.create({
      data: {
        ...dados,
        tipo: (dados.tipo as TipoPerito) || "PERITO",
        workspaceId: req.workspaceId!,
      },
    });

    return res.status(201).json(perito);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar perito" });
  }
}

export async function atualizarPerito(req: IdParam, res: Response) {
  try {
    const dados = peritoSchema.partial().parse(req.body);

    const perito = await prisma.perito.update({
      where: { id: req.params.id },
      data: {
        ...dados,
        tipo: dados.tipo as TipoPerito | undefined,
      },
    });

    return res.json(perito);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar perito" });
  }
}

export async function excluirPerito(req: IdParam, res: Response) {
  try {
    await prisma.perito.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: req.user?.userName || "sistema" },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir perito" });
  }
}
