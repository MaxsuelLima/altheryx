import { Router } from "express";
import {
  listarPrazos,
  buscarPrazo,
  criarPrazo,
  atualizarPrazo,
  excluirPrazo,
  marcarStatus,
} from "../controllers/prazoController";

const router = Router();

router.get("/", listarPrazos);
router.get("/:id", buscarPrazo);
router.post("/", criarPrazo);
router.put("/:id", atualizarPrazo);
router.patch("/:id/status", marcarStatus);
router.delete("/:id", excluirPrazo);

export default router;
