-- CreateEnum
CREATE TYPE "AreaRequisicao" AS ENUM ('CONTRATOS', 'CONSULTIVO');

-- CreateEnum
CREATE TYPE "TipoRequisicao" AS ENUM ('ELABORACAO_CONTRATO', 'PARECER', 'DISTRATO', 'CONSULTIVO_PREVENTIVO', 'CONSULTIVO_MATERIAL');

-- CreateEnum
CREATE TYPE "PrioridadeRequisicao" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusRequisicao" AS ENUM ('ABERTA', 'EM_ANALISE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "requisicoes" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "solicitante" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "area" "AreaRequisicao" NOT NULL,
    "tipo" "TipoRequisicao" NOT NULL,
    "prioridade" "PrioridadeRequisicao" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusRequisicao" NOT NULL DEFAULT 'ABERTA',
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "partes_envolvidas" TEXT,
    "valor_envolvido" DECIMAL(15,2),
    "prazo_desejado" TIMESTAMP(3),
    "resposta" TEXT,
    "responsavel" TEXT,
    "concluida_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisicoes_pkey" PRIMARY KEY ("id")
);
