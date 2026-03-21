-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('CRIACAO', 'ATUALIZACAO', 'EXCLUSAO');

-- CreateEnum
CREATE TYPE "StatusAprovacao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- AlterTable
ALTER TABLE "advogados" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "calendario_tribunais" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "documentos" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "escritorios" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "financeiros" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "juizes" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "movimentacoes" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "parcelas" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "prazos" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "processos" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "procuracoes" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "publicacoes" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "requisicoes" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "testemunhas" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "deletado_em" TIMESTAMP(3),
ADD COLUMN     "deletado_por" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "acao" "AcaoAuditoria" NOT NULL,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "usuario" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprovacoes_pendentes" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "dados_atuais" JSONB NOT NULL,
    "dados_propostos" JSONB NOT NULL,
    "status" "StatusAprovacao" NOT NULL DEFAULT 'PENDENTE',
    "solicitado_por" TEXT NOT NULL,
    "aprovado_por" TEXT,
    "motivo_rejeicao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvido_em" TIMESTAMP(3),

    CONSTRAINT "aprovacoes_pendentes_pkey" PRIMARY KEY ("id")
);
