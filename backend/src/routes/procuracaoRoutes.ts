import { Router } from "express";
import {
  listarProcuracoes,
  buscarProcuracao,
  criarProcuracao,
  atualizarProcuracao,
  excluirProcuracao,
  alertasRenovacao,
} from "../controllers/procuracaoController";

const router = Router();

router.get("/", listarProcuracoes);
router.get("/alertas", alertasRenovacao);
router.get("/:id", buscarProcuracao);
router.post("/", criarProcuracao);
router.put("/:id", atualizarProcuracao);
router.delete("/:id", excluirProcuracao);

export default router;
