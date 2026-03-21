import { Router } from "express";
import {
  listarAprovacoes,
  buscarAprovacao,
  aprovarAlteracao,
  rejeitarAlteracao,
  dashboardAprovacoes,
} from "../controllers/aprovacaoController";

const router = Router();

router.get("/dashboard", dashboardAprovacoes);
router.get("/", listarAprovacoes);
router.get("/:id", buscarAprovacao);
router.post("/:id/aprovar", aprovarAlteracao);
router.post("/:id/rejeitar", rejeitarAlteracao);

export default router;
