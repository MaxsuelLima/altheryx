import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const publishPath = path.resolve("../altheryx-publish");
const backendPath = path.resolve("backend");
const frontendPath = path.resolve("frontend");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((file) => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function removeIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function incrementVersion(version) {
  const parts = version.split(".").map(Number);
  parts[2]++;
  return parts.join(".");
}

// --- Incrementar versão ---
const backendPkgPath = path.join(backendPath, "package.json");
const backendPkg = JSON.parse(fs.readFileSync(backendPkgPath, "utf8"));
const oldVersion = backendPkg.version;
const newVersion = incrementVersion(oldVersion);
backendPkg.version = newVersion;
fs.writeFileSync(backendPkgPath, JSON.stringify(backendPkg, null, 2) + "\n", "utf8");

console.log(`\n📦 Versão: ${oldVersion} → ${newVersion}`);
console.log(`📂 Publicando em: ${publishPath}\n`);

// --- Build backend ---
console.log("🔧 Build backend...");
execSync("npm run build", { cwd: backendPath, stdio: "inherit" });

// --- Build frontend ---
console.log("🔧 Build frontend...");
execSync("npm run build", { cwd: frontendPath, stdio: "inherit" });

// --- Preparar pasta publish ---
if (!fs.existsSync(publishPath)) {
  fs.mkdirSync(publishPath, { recursive: true });
}

// Backend dist → publish/dist
console.log("📁 Copiando backend/dist → dist/");
const distTarget = path.join(publishPath, "dist");
removeIfExists(distTarget);
copyRecursive(path.join(backendPath, "dist"), distTarget);

// Prisma → publish/prisma
console.log("📁 Copiando prisma/");
const prismaTarget = path.join(publishPath, "prisma");
removeIfExists(prismaTarget);
copyRecursive(path.join(backendPath, "prisma"), prismaTarget);

// Frontend dist → publish/public (servido como static pelo Express)
console.log("📁 Copiando frontend/dist → public/");
const publicTarget = path.join(publishPath, "public");
removeIfExists(publicTarget);
copyRecursive(path.join(frontendPath, "dist"), publicTarget);

// package.json do backend (sem devDependencies)
console.log("📁 Copiando package.json e package-lock.json...");
const publishPkg = { ...backendPkg };
delete publishPkg.devDependencies;
publishPkg.scripts = {
  start: "node dist/server.js",
  "prisma:migrate": "prisma migrate deploy",
  "prisma:generate": "prisma generate",
};
fs.writeFileSync(
  path.join(publishPath, "package.json"),
  JSON.stringify(publishPkg, null, 2) + "\n",
  "utf8"
);

if (fs.existsSync(path.join(backendPath, "package-lock.json"))) {
  fs.copyFileSync(
    path.join(backendPath, "package-lock.json"),
    path.join(publishPath, "package-lock.json")
  );
}

// --- Ajustar .gitignore do publish (garantir que dist e public não sejam ignorados) ---
const publishGitignore = path.join(publishPath, ".gitignore");
if (fs.existsSync(publishGitignore)) {
  let content = fs.readFileSync(publishGitignore, "utf8");
  // Remover linhas que ignoram dist
  content = content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed !== "dist" && trimmed !== "/dist" && trimmed !== "dist/";
    })
    .join("\n");

  // Garantir que node_modules e .env continuem ignorados
  if (!content.includes("node_modules")) content += "\nnode_modules/\n";
  if (!content.includes(".env")) content += "\n.env\n.env.*\n!.env.example\n";

  fs.writeFileSync(publishGitignore, content, "utf8");
}

// --- Git push ---
console.log("\n⬆️ Fazendo deploy...");
execSync("git add .", { cwd: publishPath, stdio: "inherit" });

try {
  execSync(`git commit -m "v${newVersion}"`, { cwd: publishPath, stdio: "inherit" });
} catch {
  console.log("⚠️ Nenhuma alteração para commitar.");
  process.exit(0);
}

execSync("git push", { cwd: publishPath, stdio: "inherit" });

console.log(`\n✅ Deploy v${newVersion} finalizado!`);
