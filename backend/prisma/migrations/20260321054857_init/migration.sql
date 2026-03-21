-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADVOGADO', 'ESTAGIARIO', 'SECRETARIA');

-- CreateEnum
CREATE TYPE "StatusProcesso" AS ENUM ('EM_ANDAMENTO', 'SUSPENSO', 'ARQUIVADO', 'ENCERRADO', 'AGUARDANDO_JULGAMENTO');

-- CreateEnum
CREATE TYPE "TipoParte" AS ENUM ('AUTOR', 'REU', 'TERCEIRO_INTERESSADO', 'ASSISTENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ESTAGIARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" CHAR(2),
    "cep" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escritorios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" CHAR(2),
    "cep" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escritorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advogados" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "oab" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "especialidade" TEXT,
    "escritorio_id" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advogados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "juizes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tribunal" TEXT,
    "vara" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "juizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testemunhas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "profissao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testemunhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos" (
    "id" TEXT NOT NULL,
    "numero_processo" TEXT NOT NULL,
    "status" "StatusProcesso" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "tribunal" TEXT NOT NULL,
    "competencia" TEXT,
    "assunto" TEXT NOT NULL,
    "valor_causa" DECIMAL(15,2),
    "segredo_justica" BOOLEAN NOT NULL DEFAULT false,
    "tutela_liminar" BOOLEAN NOT NULL DEFAULT false,
    "ultima_movimentacao" TIMESTAMP(3),
    "observacoes" TEXT,
    "advogado_id" TEXT,
    "juiz_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partes_processo" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "tipo_parte" "TipoParte" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partes_processo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos_testemunhas" (
    "id" TEXT NOT NULL,
    "processo_id" TEXT NOT NULL,
    "testemunha_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processos_testemunhas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_cnpj_key" ON "clientes"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "escritorios_cnpj_key" ON "escritorios"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "advogados_oab_key" ON "advogados"("oab");

-- CreateIndex
CREATE UNIQUE INDEX "testemunhas_cpf_key" ON "testemunhas"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "processos_numero_processo_key" ON "processos"("numero_processo");

-- CreateIndex
CREATE UNIQUE INDEX "partes_processo_processo_id_cliente_id_key" ON "partes_processo"("processo_id", "cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "processos_testemunhas_processo_id_testemunha_id_key" ON "processos_testemunhas"("processo_id", "testemunha_id");

-- AddForeignKey
ALTER TABLE "advogados" ADD CONSTRAINT "advogados_escritorio_id_fkey" FOREIGN KEY ("escritorio_id") REFERENCES "escritorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos" ADD CONSTRAINT "processos_advogado_id_fkey" FOREIGN KEY ("advogado_id") REFERENCES "advogados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos" ADD CONSTRAINT "processos_juiz_id_fkey" FOREIGN KEY ("juiz_id") REFERENCES "juizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partes_processo" ADD CONSTRAINT "partes_processo_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partes_processo" ADD CONSTRAINT "partes_processo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_testemunhas" ADD CONSTRAINT "processos_testemunhas_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_testemunhas" ADD CONSTRAINT "processos_testemunhas_testemunha_id_fkey" FOREIGN KEY ("testemunha_id") REFERENCES "testemunhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
