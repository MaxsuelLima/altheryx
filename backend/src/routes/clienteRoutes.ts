import { Router } from "express";
import {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  excluirCliente,
} from "../controllers/clienteController";

const router = Router();

router.get("/", listarClientes);
router.get("/:id", buscarCliente);
router.post("/", criarCliente);
router.put("/:id", atualizarCliente);
router.delete("/:id", excluirCliente);

export default router;
