import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
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

const publicPath = path.join(__dirname, "..", "public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

app.use("/api/auth", authRoutes);
app.use("/api/admin", authenticate, requireMaster, injectRequestContext, adminRoutes);
app.use("/api", authenticate, injectWorkspace, injectRequestContext, routes);

if (fs.existsSync(publicPath)) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
