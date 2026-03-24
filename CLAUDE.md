# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Communicate in pt-BR. Minimal comments in code, never comment CSS.

## Commands

```bash
npm run dev              # Starts backend (tsx watch) + frontend (vite) concurrently
npm run dev:backend      # Backend only (tsx watch, port 3001)
npm run dev:frontend     # Frontend only (vite, port 5173)
npm run install:all      # Install deps for both backend and frontend
npm run deploy           # Build, version bump, publish to ../altheryx-publish
```

### Backend-specific (run from /backend)
```bash
npm run build            # tsc → dist/
npx prisma migrate dev   # Run migrations
npx prisma generate      # Regenerate Prisma client (required after schema changes)
npx prisma studio        # Visual database browser
```

### Frontend-specific (run from /frontend)
```bash
npm run build            # tsc -b && vite build
```

## Architecture

Monorepo: `backend/` (Express + Prisma + PostgreSQL) and `frontend/` (React 19 + Vite + Tailwind).

### Backend

**Server setup** (`backend/src/server.ts`): In production, serves frontend static files from `public/`. API routes are prefixed with `/api`. SPA fallback (`*` → index.html) is placed after API routes.

**Route order matters**:
1. `express.static(publicPath)` — unauthenticated, serves frontend assets
2. `/api/auth` — unauthenticated (login endpoints)
3. `/api/admin` — authenticate + requireMaster + injectRequestContext
4. `/api/*` — authenticate + injectWorkspace + injectRequestContext
5. `*` catch-all — serves index.html for SPA client-side routing

**Prisma Client Extensions** (`backend/src/lib/prisma.ts`): Exports `prisma` (extended) and `prismaBase` (raw). The extended client auto-injects:
- Soft delete filter (`deletadoEm: null`) on findMany/findFirst for 18 models
- Audit log creation on create/update/upsert (reads context from AsyncLocalStorage)

Use `prismaBase` only in `auditService.ts` (criarAprovacao) to avoid recursive audit.

**Request context** (`backend/src/lib/requestContext.ts`): AsyncLocalStorage carries `usuario`, `ip`, `workspaceId` through the request lifecycle. Injected by `requestContextMiddleware.ts`.

**Approval workflow**: Entities in `ENTIDADES_SENSIVEIS` (Processo, Financeiro) create an `AprovacaoPendente` instead of direct update. Controllers return 202 with approval ID.

**Multi-tenancy**: All queries are scoped by `req.workspaceId` (injected by `injectWorkspace` middleware).

### Frontend

**Auth flow**: SelectWorkspace (`/`) → WorkspaceLogin (`/workspace/:slug/login`) → workspace routes. Separate master flow at `/admin/login`.

**API client** (`frontend/src/lib/api.ts`): Axios with `baseURL: "/api"`. In dev, Vite proxies `/api` → `http://localhost:3001`. 401 interceptor clears localStorage and redirects to `/`.

**Theming**: CSS variables in `index.css` switched by `data-theme` attribute on `<html>`. Tailwind maps `theme()` colors to these variables. Dark/light stored in `localStorage("altheryx-theme")`.

**Route guards**: `WorkspaceGuard` wraps workspace routes (checks auth + workspace). `MasterGuard` wraps admin routes.

### Deployment

`deploy.mjs` bumps patch version, builds both projects, copies `backend/dist` → `dist`, `frontend/dist` → `public`, plus `prisma/` and production `package.json` to `../altheryx-publish/`, then git pushes.

On the server: `npm install && npx prisma generate && pm2 start dist/server.js --name altheryx`. The `.env` goes in the root of `altheryx-publish`.

## Key Conventions

- **Soft delete**: Set `deletadoEm: new Date()` and `deletadoPor: req.user?.userName || "sistema"` — never hard delete
- **Validation**: Zod schemas in controllers for request body validation
- **Controller pattern**: try/catch with Zod parse, Prisma query, JSON response. No manual audit calls (handled by Prisma extension)
- **Express types**: `req.user` and `req.workspaceId` are extended in `backend/src/types/express.d.ts`
- **Enums in Portuguese**: AcaoAuditoria (CRIACAO, ATUALIZACAO, EXCLUSAO), StatusProcesso, FaseProcessual, etc.
