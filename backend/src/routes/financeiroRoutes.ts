import { Router } from "express";
import {
  buscarFinanceiro,
  atualizarFinanceiro,
  adicionarParcela,
  atualizarParcela,
  excluirParcela,
} from "../controllers/financeiroController";
import { getInsights } from "../controllers/insightsController";

const router = Router();

router.get("/insights", getInsights);
router.get("/:id", buscarFinanceiro);
router.put("/:id", atualizarFinanceiro);
router.post("/:id/parcelas", adicionarParcela);
router.put("/:id/parcelas/:parcelaId", atualizarParcela);
router.delete("/:id/parcelas/:parcelaId", excluirParcela);

export default router;
