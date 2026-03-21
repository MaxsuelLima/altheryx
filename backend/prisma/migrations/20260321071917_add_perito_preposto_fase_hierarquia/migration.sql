-- CreateEnum
CREATE TYPE "TipoPerito" AS ENUM ('PERITO', 'ASSISTENTE_TECNICO');

-- CreateEnum
CREATE TYPE "TipoProcuracao" AS ENUM ('OUTORGADA', 'SUBSTABELECIMENTO_COM_RESERVA', 'SUBSTABELECIMENTO_SEM_RESERVA');

-- CreateEnum
CREATE TYPE "FaseProcessual" AS ENUM ('CONHECIMENTO', 'INSTRUCAO', 'JULGAMENTO', 'RECURSAL', 'EXECUCAO', 'CUMPRIMENTO_SENTENCA', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "ClassificacaoAnexo" AS ENUM ('DOCUMENTACAO_IDENTIFICACAO', 'COMPROVANTE_RENDA', 'PROCURACAO', 'CONTRATO', 'COMPROVANTE_PAGAMENTO', 'NOTA_FISCAL', 'LAUDO_PERICIAL', 'PARECER_TECNICO', 'OUTRO');

-- AlterEnum
ALTER TYPE "TipoParte" ADD VALUE 'AMICUS_CURIAE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoRequisicao" ADD VALUE 'AVALIACAO_CONTRATO';
ALTER TYPE "TipoRequisicao" ADD VALUE 'ADITAMENTO_CONTRATO';
ALTER TYPE "TipoRequisicao" ADD VALUE 'RESCISAO_RESOLUCAO';
ALTER TYPE "TipoRequisicao" ADD VALUE 'CONSULTIVO_OUTROS';

-- AlterTable
ALTER TABLE "documentos" ADD COLUMN     "classificacao_anexo" "ClassificacaoAnexo",
ADD COLUMN     "documento_pai_id" TEXT;

-- AlterTable
ALTER TABLE "prazos" ADD COLUMN     "publicacao_id" TEXT;

-- AlterTable
ALTER TABLE "processos" ADD COLUMN     "comarca" TEXT,
ADD COLUMN     "fase" "FaseProcessual" DEFAULT 'CONHECIMENTO';

-- AlterTable
ALTER TABLE "procuracoes" ADD COLUMN     "tipo_procuracao" "TipoProcuracao" NOT NULL DEFAULT 'OUTORGADA';

-- CreateTable
CREATE TABLE "peritos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "tipo" "TipoPerito" NOT NULL DEFAULT 'PERITO',
    "especialidade" TEXT,
    "registro_profissional" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),
    "deletado_por" TEXT,

    CONSTRAINT "peritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos_peritos" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "perito_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processos_peritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prepostos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "empresa" TEXT,
    "cargo" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deletado_em" TIMESTAMP(3),
    "deletado_por" TEXT,

    CONSTRAINT "prepostos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos_prepostos" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "preposto_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processos_prepostos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "peritos_cpf_key" ON "peritos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "processos_peritos_processo_id_perito_id_key" ON "processos_peritos"("processo_id", "perito_id");

-- CreateIndex
CREATE UNIQUE INDEX "prepostos_cpf_key" ON "prepostos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "processos_prepostos_processo_id_preposto_id_key" ON "processos_prepostos"("processo_id", "preposto_id");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_documento_pai_id_fkey" FOREIGN KEY ("documento_pai_id") REFERENCES "documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prazos" ADD CONSTRAINT "prazos_publicacao_id_fkey" FOREIGN KEY ("publicacao_id") REFERENCES "publicacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_peritos" ADD CONSTRAINT "processos_peritos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_peritos" ADD CONSTRAINT "processos_peritos_perito_id_fkey" FOREIGN KEY ("perito_id") REFERENCES "peritos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_prepostos" ADD CONSTRAINT "processos_prepostos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_prepostos" ADD CONSTRAINT "processos_prepostos_preposto_id_fkey" FOREIGN KEY ("preposto_id") REFERENCES "prepostos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
