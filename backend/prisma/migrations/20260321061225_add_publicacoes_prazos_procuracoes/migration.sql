-- CreateEnum
CREATE TYPE "TipoPrazo" AS ENUM ('AUDIENCIA', 'PRAZO_PROCESSUAL', 'PERICIA', 'SUSTENTACAO_ORAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusPrazo" AS ENUM ('PENDENTE', 'CUMPRIDO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "StatusProcuracao" AS ENUM ('VIGENTE', 'VENCIDA', 'REVOGADA');

-- CreateTable
CREATE TABLE "publicacoes" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT,
    "palavra_chave" TEXT NOT NULL,
    "diario_origem" TEXT NOT NULL,
    "data_publicacao" TIMESTAMP(3) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prazos" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "tipo" "TipoPrazo" NOT NULL DEFAULT 'PRAZO_PROCESSUAL',
    "descricao" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TEXT,
    "hora_fim" TEXT,
    "local" TEXT,
    "status" "StatusPrazo" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "preposto_nome" TEXT,
    "preposto_contato" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prazos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prazos_testemunhas" (
    "id" TEXT NOT NULL,
    "prazo_id" TEXT NOT NULL,
    "testemunha_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prazos_testemunhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_tribunais" (
    "id" TEXT NOT NULL,
    "tribunal" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendario_tribunais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procuracoes" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT,
    "outorgante" TEXT NOT NULL,
    "outorgado" TEXT NOT NULL,
    "poderes" TEXT NOT NULL,
    "data_emissao" TIMESTAMP(3) NOT NULL,
    "data_validade" TIMESTAMP(3),
    "status" "StatusProcuracao" NOT NULL DEFAULT 'VIGENTE',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prazos_testemunhas_prazo_id_testemunha_id_key" ON "prazos_testemunhas"("prazo_id", "testemunha_id");

-- AddForeignKey
ALTER TABLE "publicacoes" ADD CONSTRAINT "publicacoes_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prazos" ADD CONSTRAINT "prazos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prazos_testemunhas" ADD CONSTRAINT "prazos_testemunhas_prazo_id_fkey" FOREIGN KEY ("prazo_id") REFERENCES "prazos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prazos_testemunhas" ADD CONSTRAINT "prazos_testemunhas_testemunha_id_fkey" FOREIGN KEY ("testemunha_id") REFERENCES "testemunhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procuracoes" ADD CONSTRAINT "procuracoes_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
