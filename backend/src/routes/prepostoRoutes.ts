import { Router } from "express";
import {
  listarPrepostos,
  buscarPreposto,
  criarPreposto,
  atualizarPreposto,
  excluirPreposto,
} from "../controllers/prepostoController";

const router = Router();

router.get("/", listarPrepostos);
router.get("/:id", buscarPreposto);
router.post("/", criarPreposto);
router.put("/:id", atualizarPreposto);
router.delete("/:id", excluirPreposto);

export default router;
