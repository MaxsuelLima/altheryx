import { Router } from "express";
import {
  listarPeritos,
  buscarPerito,
  criarPerito,
  atualizarPerito,
  excluirPerito,
} from "../controllers/peritoController";

const router = Router();

router.get("/", listarPeritos);
router.get("/:id", buscarPerito);
router.post("/", criarPerito);
router.put("/:id", atualizarPerito);
router.delete("/:id", excluirPerito);

export default router;
