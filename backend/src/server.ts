import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import routes from "./routes";
import { authenticate, requireMaster, injectWorkspace } from "./middleware/authMiddleware";
import { injectRequestContext } from "./middleware/requestContextMiddleware";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/admin", authenticate, requireMaster, injectRequestContext, adminRoutes);
app.use(authenticate, injectWorkspace, injectRequestContext, routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
