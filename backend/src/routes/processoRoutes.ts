import { Router } from "express";
import { upload } from "../lib/upload";
import {
  listarProcessos,
  buscarProcesso,
  criarProcesso,
  atualizarProcesso,
  excluirProcesso,
  adicionarMovimentacao,
  excluirMovimentacao,
  adicionarParte,
  removerParte,
} from "../controllers/processoController";
import {
  listarDocumentos,
  uploadDocumento,
  downloadDocumento,
  atualizarDocumento,
  excluirDocumento,
} from "../controllers/documentoController";

const router = Router();

router.get("/", listarProcessos);
router.get("/:id", buscarProcesso);
router.post("/", criarProcesso);
router.put("/:id", atualizarProcesso);
router.delete("/:id", excluirProcesso);

router.post("/:id/movimentacoes", adicionarMovimentacao);
router.delete("/:id/movimentacoes/:movId", excluirMovimentacao);

router.post("/:id/partes", adicionarParte);
router.delete("/:id/partes/:parteId", removerParte);

router.get("/:id/documentos", listarDocumentos);
router.post("/:id/documentos", upload.single("arquivo"), uploadDocumento);
router.get("/:id/documentos/:docId/download", downloadDocumento);
router.put("/:id/documentos/:docId", atualizarDocumento);
router.delete("/:id/documentos/:docId", excluirDocumento);

export default router;
