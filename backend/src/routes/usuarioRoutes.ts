import { Router } from "express";
import { listarUsuarios, criarUsuario, atualizarUsuario, excluirUsuario } from "../controllers/usuarioController";
import { requireWorkspaceAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireWorkspaceAdmin, listarUsuarios);
router.post("/", requireWorkspaceAdmin, criarUsuario);
router.put("/:id", requireWorkspaceAdmin, atualizarUsuario);
router.delete("/:id", requireWorkspaceAdmin, excluirUsuario);

export default router;
