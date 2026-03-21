-- CreateEnum
CREATE TYPE "OrigemDocumento" AS ENUM ('PARTE_AUTORA', 'PARTE_RE', 'JUDICIARIO', 'MINISTERIO_PUBLICO', 'PERITO', 'OUTRO');

-- CreateEnum
CREATE TYPE "FlagDecisao" AS ENUM ('NENHUMA', 'DEFERIDA', 'INDEFERIDA', 'PARCIALMENTE_DEFERIDA', 'SENTENCA', 'ACORDAO', 'DESPACHO');

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "nome_original" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "origem" "OrigemDocumento" NOT NULL DEFAULT 'OUTRO',
    "flag_decisao" "FlagDecisao" NOT NULL DEFAULT 'NENHUMA',
    "descricao" TEXT,
    "data_documento" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
