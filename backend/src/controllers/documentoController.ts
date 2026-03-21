import { Request, Response } from "express";
import { OrigemDocumento, FlagDecisao, ClassificacaoAnexo } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { uploadDir } from "../lib/upload";
import { registrarAuditoria, getUsuario, getIp } from "../lib/auditService";
import path from "path";
import fs from "fs";

export async function listarDocumentos(req: Request<{ id: string }>, res: Response) {
  try {
    const origem = req.query.origem as string | undefined;
    const flagDecisao = req.query.flagDecisao as string | undefined;

    const documentos = await prisma.documento.findMany({
      where: {
        workspaceId: req.workspaceId!,
        processoId: req.params.id,
        deletadoEm: null,
        documentoPaiId: null,
        ...(origem && { origem: origem as never }),
        ...(flagDecisao && { flagDecisao: flagDecisao as never }),
      },
      include: {
        anexos: {
          where: { deletadoEm: null },
          orderBy: { dataDocumento: "asc" },
        },
      },
      orderBy: { dataDocumento: "desc" },
    });

    return res.json(documentos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar documentos" });
  }
}

export async function uploadDocumento(req: Request<{ id: string }>, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const documento = await prisma.documento.create({
      data: {
        workspaceId: req.workspaceId!,
        processoId: req.params.id,
        nomeOriginal: req.file.originalname,
        nomeArquivo: req.file.filename,
        mimeType: req.file.mimetype,
        tamanho: req.file.size,
        origem: (req.body.origem as OrigemDocumento) || "OUTRO",
        flagDecisao: (req.body.flagDecisao as FlagDecisao) || "NENHUMA",
        classificacaoAnexo: (req.body.classificacaoAnexo as ClassificacaoAnexo) || null,
        documentoPaiId: req.body.documentoPaiId || null,
        descricao: req.body.descricao || null,
        dataDocumento: req.body.dataDocumento
          ? new Date(req.body.dataDocumento)
          : new Date(),
      },
    });

    await registrarAuditoria({
      entidade: "Documento",
      entidadeId: documento.id,
      acao: "CRIACAO",
      dadosNovos: { id: documento.id, nomeOriginal: documento.nomeOriginal, processoId: req.params.id },
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(201).json(documento);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao fazer upload" });
  }
}

export async function downloadDocumento(req: Request<{ id: string; docId: string }>, res: Response) {
  try {
    const documento = await prisma.documento.findFirst({
      where: { id: req.params.docId, workspaceId: req.workspaceId! },
    });

    if (!documento || documento.deletadoEm) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    const filePath = path.join(uploadDir, documento.nomeArquivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Arquivo não encontrado no servidor" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(documento.nomeOriginal)}"`);
    res.setHeader("Content-Type", documento.mimeType);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao baixar documento" });
  }
}

export async function visualizarDocumento(req: Request<{ id: string; docId: string }>, res: Response) {
  try {
    const documento = await prisma.documento.findFirst({
      where: { id: req.params.docId, workspaceId: req.workspaceId! },
    });

    if (!documento || documento.deletadoEm) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    const filePath = path.join(uploadDir, documento.nomeArquivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Arquivo não encontrado no servidor" });
    }

    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(documento.nomeOriginal)}"`);
    res.setHeader("Content-Type", documento.mimeType);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao visualizar documento" });
  }
}

export async function atualizarDocumento(req: Request<{ id: string; docId: string }>, res: Response) {
  try {
    const anterior = await prisma.documento.findFirst({ where: { id: req.params.docId, workspaceId: req.workspaceId! } });

    const documento = await prisma.documento.update({
      where: { id: req.params.docId },
      data: {
        ...(req.body.origem && { origem: req.body.origem }),
        ...(req.body.flagDecisao && { flagDecisao: req.body.flagDecisao }),
        ...(req.body.classificacaoAnexo !== undefined && { classificacaoAnexo: req.body.classificacaoAnexo || null }),
        ...(req.body.descricao !== undefined && { descricao: req.body.descricao || null }),
        ...(req.body.dataDocumento && { dataDocumento: new Date(req.body.dataDocumento) }),
        ...(req.body.documentoPaiId !== undefined && { documentoPaiId: req.body.documentoPaiId || null }),
      },
    });

    await registrarAuditoria({
      entidade: "Documento",
      entidadeId: documento.id,
      acao: "ATUALIZACAO",
      dadosAnteriores: anterior,
      dadosNovos: documento,
      usuario: getUsuario(req),
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.json(documento);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar documento" });
  }
}

export async function excluirDocumento(req: Request<{ id: string; docId: string }>, res: Response) {
  try {
    const documento = await prisma.documento.findFirst({
      where: { id: req.params.docId, workspaceId: req.workspaceId! },
    });

    if (!documento) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    const usuario = getUsuario(req);

    await prisma.documento.update({
      where: { id: req.params.docId },
      data: { deletadoEm: new Date(), deletadoPor: usuario },
    });

    await registrarAuditoria({
      entidade: "Documento",
      entidadeId: req.params.docId,
      acao: "EXCLUSAO",
      dadosAnteriores: { id: documento.id, nomeOriginal: documento.nomeOriginal },
      usuario,
      ip: getIp(req),
      workspaceId: req.workspaceId,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir documento" });
  }
}
