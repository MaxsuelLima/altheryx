-- CreateEnum
CREATE TYPE "Prognostico" AS ENUM ('PROVAVEL', 'POSSIVEL', 'REMOTA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('A_VISTA', 'PARCELADO', 'HONORARIOS_EXITO', 'MISTO');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "financeiros" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "prognostico" "Prognostico" NOT NULL DEFAULT 'POSSIVEL',
    "valor_causa_estimado" DECIMAL(15,2),
    "honorarios_contrato" DECIMAL(15,2),
    "honorarios_exito" DECIMAL(15,2),
    "percentual_exito" DECIMAL(5,2),
    "forma_pagamento" "FormaPagamento" NOT NULL DEFAULT 'A_VISTA',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" TEXT NOT NULL,
    "financeiro_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financeiros_processo_id_key" ON "financeiros"("processo_id");

-- AddForeignKey
ALTER TABLE "financeiros" ADD CONSTRAINT "financeiros_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_financeiro_id_fkey" FOREIGN KEY ("financeiro_id") REFERENCES "financeiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
