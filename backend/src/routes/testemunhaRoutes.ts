import { Router } from "express";
import {
  listarTestemunhas,
  buscarTestemunha,
  criarTestemunha,
  atualizarTestemunha,
  excluirTestemunha,
} from "../controllers/testemunhaController";

const router = Router();

router.get("/", listarTestemunhas);
router.get("/:id", buscarTestemunha);
router.post("/", criarTestemunha);
router.put("/:id", atualizarTestemunha);
router.delete("/:id", excluirTestemunha);

export default router;
