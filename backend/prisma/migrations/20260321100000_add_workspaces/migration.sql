-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- Insert default workspace
INSERT INTO "workspaces" ("id", "slug", "nome", "descricao", "ativo", "criado_em", "atualizado_em")
VALUES ('00000000-0000-0000-0000-000000000001', 'default', 'Workspace Padrão', 'Workspace padrão do sistema', true, NOW(), NOW());

-- Add workspace_id to usuarios (nullable first)
ALTER TABLE "usuarios" ADD COLUMN "workspace_id" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;
UPDATE "usuarios" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "usuarios" ALTER COLUMN "workspace_id" SET NOT NULL;
-- Drop old unique on email, create composite unique
DROP INDEX IF EXISTS "usuarios_email_key";
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_workspace_id_email_key" UNIQUE ("workspace_id", "email");
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to clientes
ALTER TABLE "clientes" ADD COLUMN "workspace_id" TEXT;
UPDATE "clientes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "clientes" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "clientes_cpf_cnpj_key";
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_workspace_id_cpf_cnpj_key" UNIQUE ("workspace_id", "cpf_cnpj");
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to escritorios
ALTER TABLE "escritorios" ADD COLUMN "workspace_id" TEXT;
UPDATE "escritorios" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "escritorios" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "escritorios_cnpj_key";
ALTER TABLE "escritorios" ADD CONSTRAINT "escritorios_workspace_id_cnpj_key" UNIQUE ("workspace_id", "cnpj");
ALTER TABLE "escritorios" ADD CONSTRAINT "escritorios_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to advogados
ALTER TABLE "advogados" ADD COLUMN "workspace_id" TEXT;
UPDATE "advogados" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "advogados" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "advogados_oab_key";
ALTER TABLE "advogados" ADD CONSTRAINT "advogados_workspace_id_oab_key" UNIQUE ("workspace_id", "oab");
ALTER TABLE "advogados" ADD CONSTRAINT "advogados_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to juizes
ALTER TABLE "juizes" ADD COLUMN "workspace_id" TEXT;
UPDATE "juizes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "juizes" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "juizes" ADD CONSTRAINT "juizes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to testemunhas
ALTER TABLE "testemunhas" ADD COLUMN "workspace_id" TEXT;
UPDATE "testemunhas" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "testemunhas" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "testemunhas_cpf_key";
ALTER TABLE "testemunhas" ADD CONSTRAINT "testemunhas_workspace_id_cpf_key" UNIQUE ("workspace_id", "cpf");
ALTER TABLE "testemunhas" ADD CONSTRAINT "testemunhas_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to processos
ALTER TABLE "processos" ADD COLUMN "workspace_id" TEXT;
UPDATE "processos" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "processos" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "processos_numero_processo_key";
ALTER TABLE "processos" ADD CONSTRAINT "processos_workspace_id_numero_processo_key" UNIQUE ("workspace_id", "numero_processo");
ALTER TABLE "processos" ADD CONSTRAINT "processos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to financeiros
ALTER TABLE "financeiros" ADD COLUMN "workspace_id" TEXT;
UPDATE "financeiros" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "financeiros" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "financeiros" ADD CONSTRAINT "financeiros_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to parcelas
ALTER TABLE "parcelas" ADD COLUMN "workspace_id" TEXT;
UPDATE "parcelas" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "parcelas" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to movimentacoes
ALTER TABLE "movimentacoes" ADD COLUMN "workspace_id" TEXT;
UPDATE "movimentacoes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "movimentacoes" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to documentos
ALTER TABLE "documentos" ADD COLUMN "workspace_id" TEXT;
UPDATE "documentos" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "documentos" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to publicacoes
ALTER TABLE "publicacoes" ADD COLUMN "workspace_id" TEXT;
UPDATE "publicacoes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "publicacoes" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "publicacoes" ADD CONSTRAINT "publicacoes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to prazos
ALTER TABLE "prazos" ADD COLUMN "workspace_id" TEXT;
UPDATE "prazos" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "prazos" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "prazos" ADD CONSTRAINT "prazos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to calendario_tribunais
ALTER TABLE "calendario_tribunais" ADD COLUMN "workspace_id" TEXT;
UPDATE "calendario_tribunais" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "calendario_tribunais" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "calendario_tribunais" ADD CONSTRAINT "calendario_tribunais_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to procuracoes
ALTER TABLE "procuracoes" ADD COLUMN "workspace_id" TEXT;
UPDATE "procuracoes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "procuracoes" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "procuracoes" ADD CONSTRAINT "procuracoes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to requisicoes
ALTER TABLE "requisicoes" ADD COLUMN "workspace_id" TEXT;
UPDATE "requisicoes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "requisicoes" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "requisicoes" ADD CONSTRAINT "requisicoes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to peritos
ALTER TABLE "peritos" ADD COLUMN "workspace_id" TEXT;
UPDATE "peritos" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "peritos" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "peritos_cpf_key";
ALTER TABLE "peritos" ADD CONSTRAINT "peritos_workspace_id_cpf_key" UNIQUE ("workspace_id", "cpf");
ALTER TABLE "peritos" ADD CONSTRAINT "peritos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to prepostos
ALTER TABLE "prepostos" ADD COLUMN "workspace_id" TEXT;
UPDATE "prepostos" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "prepostos" ALTER COLUMN "workspace_id" SET NOT NULL;
DROP INDEX IF EXISTS "prepostos_cpf_key";
ALTER TABLE "prepostos" ADD CONSTRAINT "prepostos_workspace_id_cpf_key" UNIQUE ("workspace_id", "cpf");
ALTER TABLE "prepostos" ADD CONSTRAINT "prepostos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add workspace_id to audit_logs (nullable - historical data)
ALTER TABLE "audit_logs" ADD COLUMN "workspace_id" TEXT;
UPDATE "audit_logs" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add workspace_id to aprovacoes_pendentes (nullable - historical data)
ALTER TABLE "aprovacoes_pendentes" ADD COLUMN "workspace_id" TEXT;
UPDATE "aprovacoes_pendentes" SET "workspace_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "aprovacoes_pendentes" ADD CONSTRAINT "aprovacoes_pendentes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
