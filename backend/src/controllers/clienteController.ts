import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const clienteSchema = z.object({
  nome: z.string().min(2),
  cpfCnpj: z.string().min(11),
  email: z.string().email().nullable().optional(),
  telefone: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().max(2).nullable().optional(),
  cep: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
});

type IdParam = Request<{ id: string }>;

export async function listarClientes(req: Request, res: Response) {
  try {
    const busca = req.query.busca as string | undefined;
    const ativo = req.query.ativo as string | undefined;

    const clientes = await prisma.cliente.findMany({
      where: {
        workspaceId: req.workspaceId!,
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" } },
            { cpfCnpj: { contains: busca } },
            { email: { contains: busca, mode: "insensitive" } },
          ],
        }),
        ...(ativo !== undefined && { ativo: ativo === "true" }),
      },
      orderBy: { nome: "asc" },
    });

    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar clientes" });
  }
}

export async function buscarCliente(req: IdParam, res: Response) {
  try {
    const cliente = await prisma.cliente.findFirst({
      where: { id: req.params.id, workspaceId: req.workspaceId! },
      include: { partesProcesso: { include: { processo: true } } },
    });

    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });
    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar cliente" });
  }
}

export async function criarCliente(req: Request, res: Response) {
  try {
    const dados = clienteSchema.parse(req.body);
    const cliente = await prisma.cliente.create({ data: { ...dados, workspaceId: req.workspaceId! } });

    return res.status(201).json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

export async function atualizarCliente(req: IdParam, res: Response) {
  try {
    const dados = clienteSchema.partial().parse(req.body);

    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: dados,
    });

    return res.json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
}

export async function excluirCliente(req: IdParam, res: Response) {
  try {
    await prisma.cliente.update({
      where: { id: req.params.id },
      data: { deletadoEm: new Date(), deletadoPor: req.user?.userName || "sistema" },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir cliente" });
  }
}
