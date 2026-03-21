import { Router } from "express";
import { login, masterLogin, me, getWorkspaceInfo } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/master-login", masterLogin);
router.get("/me", authenticate, me);
router.get("/workspace/:slug", getWorkspaceInfo);

export default router;
