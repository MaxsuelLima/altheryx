import { Router } from "express";
import {
  listarJuizes,
  buscarJuiz,
  criarJuiz,
  atualizarJuiz,
  excluirJuiz,
} from "../controllers/juizController";

const router = Router();

router.get("/", listarJuizes);
router.get("/:id", buscarJuiz);
router.post("/", criarJuiz);
router.put("/:id", atualizarJuiz);
router.delete("/:id", excluirJuiz);

export default router;
