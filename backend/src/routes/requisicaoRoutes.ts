import { Router } from "express";
import {
  listarRequisicoes,
  buscarRequisicao,
  criarRequisicao,
  atualizarRequisicao,
  excluirRequisicao,
  dashboardRequisicoes,
} from "../controllers/requisicaoController";

const router = Router();

router.get("/", listarRequisicoes);
router.get("/dashboard", dashboardRequisicoes);
router.get("/:id", buscarRequisicao);
router.post("/", criarRequisicao);
router.put("/:id", atualizarRequisicao);
router.delete("/:id", excluirRequisicao);

export default router;
