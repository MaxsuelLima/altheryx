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
  adicionarPerito,
  removerPerito,
  adicionarPreposto,
  removerPreposto,
  duracaoMedia,
  correcaoMonetaria,
} from "../controllers/processoController";
import {
  listarDocumentos,
  uploadDocumento,
  downloadDocumento,
  visualizarDocumento,
  atualizarDocumento,
  excluirDocumento,
} from "../controllers/documentoController";

const router = Router();

router.get("/duracao-media", duracaoMedia);
router.post("/correcao-monetaria", correcaoMonetaria);

router.get("/", listarProcessos);
router.get("/:id", buscarProcesso);
router.post("/", criarProcesso);
router.put("/:id", atualizarProcesso);
router.delete("/:id", excluirProcesso);

router.post("/:id/movimentacoes", adicionarMovimentacao);
router.delete("/:id/movimentacoes/:movId", excluirMovimentacao);

router.post("/:id/partes", adicionarParte);
router.delete("/:id/partes/:parteId", removerParte);

router.post("/:id/peritos", adicionarPerito);
router.delete("/:id/peritos/:peritoId", removerPerito);

router.post("/:id/prepostos", adicionarPreposto);
router.delete("/:id/prepostos/:prepostoId", removerPreposto);

router.get("/:id/documentos", listarDocumentos);
router.post("/:id/documentos", upload.single("arquivo"), uploadDocumento);
router.get("/:id/documentos/:docId/download", downloadDocumento);
router.get("/:id/documentos/:docId/visualizar", visualizarDocumento);
router.put("/:id/documentos/:docId", atualizarDocumento);
router.delete("/:id/documentos/:docId", excluirDocumento);

export default router;
