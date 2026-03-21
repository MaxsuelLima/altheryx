import { Router } from "express";
import {
  relatorioProcessos,
  relatorioClientes,
  relatorioFinanceiro,
  relatorioPrazos,
  relatorioProcuracoes,
  relatorioRequisicoes,
  relatorioFiltros,
} from "../controllers/relatorioController";

const router = Router();

router.get("/filtros", relatorioFiltros);
router.get("/processos", relatorioProcessos);
router.get("/clientes", relatorioClientes);
router.get("/financeiro", relatorioFinanceiro);
router.get("/prazos", relatorioPrazos);
router.get("/procuracoes", relatorioProcuracoes);
router.get("/requisicoes", relatorioRequisicoes);

export default router;
