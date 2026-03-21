import { Router } from "express";
import {
  listarEscritorios,
  buscarEscritorio,
  criarEscritorio,
  atualizarEscritorio,
  excluirEscritorio,
} from "../controllers/escritorioController";

const router = Router();

router.get("/", listarEscritorios);
router.get("/:id", buscarEscritorio);
router.post("/", criarEscritorio);
router.put("/:id", atualizarEscritorio);
router.delete("/:id", excluirEscritorio);

export default router;
