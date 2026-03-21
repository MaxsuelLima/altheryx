import { Router } from "express";
import {
  listarEventos,
  criarEvento,
  atualizarEvento,
  excluirEvento,
  listarTribunais,
} from "../controllers/calendarioController";

const router = Router();

router.get("/", listarEventos);
router.get("/tribunais", listarTribunais);
router.post("/", criarEvento);
router.put("/:id", atualizarEvento);
router.delete("/:id", excluirEvento);

export default router;
