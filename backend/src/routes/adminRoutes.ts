import { Router } from "express";
import {
  listarWorkspaces,
  criarWorkspace,
  atualizarWorkspace,
  buscarWorkspace,
  adicionarUsuarioWorkspace,
} from "../controllers/masterAdminController";

const router = Router();

router.get("/workspaces", listarWorkspaces);
router.post("/workspaces", criarWorkspace);
router.get("/workspaces/:id", buscarWorkspace);
router.put("/workspaces/:id", atualizarWorkspace);
router.post("/workspaces/:id/usuarios", adicionarUsuarioWorkspace);

export default router;
