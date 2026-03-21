import { Router } from "express";
import {
  listarAdvogados,
  buscarAdvogado,
  criarAdvogado,
  atualizarAdvogado,
  excluirAdvogado,
} from "../controllers/advogadoController";

const router = Router();

router.get("/", listarAdvogados);
router.get("/:id", buscarAdvogado);
router.post("/", criarAdvogado);
router.put("/:id", atualizarAdvogado);
router.delete("/:id", excluirAdvogado);

export default router;
