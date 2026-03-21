import { Router } from "express";
import {
  listarAuditorias,
  buscarAuditoria,
  historicoEntidade,
} from "../controllers/auditoriaController";

const router = Router();

router.get("/", listarAuditorias);
router.get("/:id", buscarAuditoria);
router.get("/:entidade/:entidadeId", historicoEntidade);

export default router;
