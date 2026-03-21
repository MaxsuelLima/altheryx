import { Router } from "express";
import {
  listarPublicacoes,
  criarPublicacao,
  atualizarPublicacao,
  marcarLida,
  excluirPublicacao,
  buscarPorPalavraChave,
} from "../controllers/publicacaoController";

const router = Router();

router.get("/", listarPublicacoes);
router.get("/buscar", buscarPorPalavraChave);
router.post("/", criarPublicacao);
router.put("/:id", atualizarPublicacao);
router.patch("/:id/lida", marcarLida);
router.delete("/:id", excluirPublicacao);

export default router;
