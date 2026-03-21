import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Filtros {
  tribunais: string[];
  competencias: string[];
  advogados: { id: string; nome: string; oab: string }[];
  estados: string[];
}

type ModuloRelatorio = "processos" | "clientes" | "financeiro" | "prazos" | "procuracoes" | "requisicoes";

const moduloLabels: Record<ModuloRelatorio, string> = {
  processos: "Processos",
  clientes: "Clientes",
  financeiro: "Financeiro",
  prazos: "Prazos",
  procuracoes: "Procurações",
  requisicoes: "Requisições",
};

function formatCurrency(val: number) {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default function Relatorios() {
  const [filtros, setFiltros] = useState<Filtros | null>(null);
  const [modulo, setModulo] = useState<ModuloRelatorio>("processos");
  const [resultado, setResultado] = useState<unknown[] | null>(null);
  const [resumo, setResumo] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [filtroProcesso, setFiltroProcesso] = useState({
    status: "",
    tribunal: "",
    competencia: "",
    advogadoId: "",
    dataInicio: "",
    dataFim: "",
  });

  const [filtroCliente, setFiltroCliente] = useState({
    ativo: "",
    estado: "",
    dataInicio: "",
    dataFim: "",
  });

  const [filtroFinanceiro, setFiltroFinanceiro] = useState({
    prognostico: "",
    statusParcela: "",
    dataInicio: "",
    dataFim: "",
  });

  const [filtroPrazo, setFiltroPrazo] = useState({
    status: "",
    tipo: "",
    dataInicio: "",
    dataFim: "",
  });

  const [filtroProcuracao, setFiltroProcuracao] = useState({
    status: "",
    vencendo: "",
  });

  const [filtroRequisicao, setFiltroRequisicao] = useState({
    status: "",
    area: "",
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    api.get("/relatorios/filtros").then((res) => setFiltros(res.data));
  }, []);

  const gerarRelatorio = async () => {
    setLoading(true);
    setResultado(null);
    setResumo(null);

    try {
      let params: Record<string, string> = {};

      switch (modulo) {
        case "processos":
          params = { ...filtroProcesso };
          break;
        case "clientes":
          params = { ...filtroCliente };
          break;
        case "financeiro":
          params = { ...filtroFinanceiro };
          break;
        case "prazos":
          params = { ...filtroPrazo };
          break;
        case "procuracoes":
          params = { ...filtroProcuracao };
          break;
        case "requisicoes":
          params = { ...filtroRequisicao };
          break;
      }

      const cleanParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) cleanParams.set(k, v);
      });

      const res = await api.get(`/relatorios/${modulo}?${cleanParams}`);

      if (modulo === "financeiro") {
        setResultado(res.data.dados);
        setResumo(res.data.resumo);
        setTotalRegistros(res.data.dados.length);
      } else {
        setResultado(res.data);
        setTotalRegistros(res.data.length);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFiltros = () => {
    switch (modulo) {
      case "processos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroProcesso.status}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="SUSPENSO">Suspenso</option>
                <option value="ARQUIVADO">Arquivado</option>
                <option value="ENCERRADO">Encerrado</option>
                <option value="AGUARDANDO_JULGAMENTO">Aguardando Julgamento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tribunal</label>
              <select
                value={filtroProcesso.tribunal}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, tribunal: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {filtros?.tribunais.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competência</label>
              <select
                value={filtroProcesso.competencia}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, competencia: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                {filtros?.competencias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advogado</label>
              <select
                value={filtroProcesso.advogadoId}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, advogadoId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {filtros?.advogados.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome} ({a.oab})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={filtroProcesso.dataInicio}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, dataInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={filtroProcesso.dataFim}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, dataFim: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case "clientes":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroCliente.ativo}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, ativo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
              <select
                value={filtroCliente.estado}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, estado: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {filtros?.estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cadastrado De</label>
              <input
                type="date"
                value={filtroCliente.dataInicio}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, dataInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
              <input
                type="date"
                value={filtroCliente.dataFim}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, dataFim: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case "financeiro":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prognóstico</label>
              <select
                value={filtroFinanceiro.prognostico}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, prognostico: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="PROVAVEL">Perda Provável</option>
                <option value="POSSIVEL">Perda Possível</option>
                <option value="REMOTA">Perda Remota</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Parcela</label>
              <select
                value={filtroFinanceiro.statusParcela}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, statusParcela: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGA">Paga</option>
                <option value="ATRASADA">Atrasada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento De</label>
              <input
                type="date"
                value={filtroFinanceiro.dataInicio}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, dataInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
              <input
                type="date"
                value={filtroFinanceiro.dataFim}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, dataFim: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case "prazos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroPrazo.status}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CUMPRIDO">Cumprido</option>
                <option value="PERDIDO">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filtroPrazo.tipo}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, tipo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="AUDIENCIA">Audiência</option>
                <option value="PRAZO_PROCESSUAL">Prazo Processual</option>
                <option value="PERICIA">Perícia</option>
                <option value="SUSTENTACAO_ORAL">Sustentação Oral</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data De</label>
              <input
                type="date"
                value={filtroPrazo.dataInicio}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, dataInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
              <input
                type="date"
                value={filtroPrazo.dataFim}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, dataFim: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case "procuracoes":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroProcuracao.status}
                onChange={(e) => setFiltroProcuracao({ ...filtroProcuracao, status: e.target.value, vencendo: "" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="VIGENTE">Vigente</option>
                <option value="VENCIDA">Vencida</option>
                <option value="REVOGADA">Revogada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtro Especial</label>
              <select
                value={filtroProcuracao.vencendo}
                onChange={(e) => setFiltroProcuracao({ ...filtroProcuracao, vencendo: e.target.value, status: "" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Nenhum</option>
                <option value="true">Vencendo em 30 dias</option>
              </select>
            </div>
          </div>
        );

      case "requisicoes":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroRequisicao.status}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="ABERTA">Aberta</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                value={filtroRequisicao.area}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, area: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                <option value="CONTRATOS">Contratos</option>
                <option value="CONSULTIVO">Consultivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Criada De</label>
              <input
                type="date"
                value={filtroRequisicao.dataInicio}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, dataInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
              <input
                type="date"
                value={filtroRequisicao.dataFim}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, dataFim: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );
    }
  };

  const renderResultado = () => {
    if (!resultado) return null;

    const dados = resultado as Record<string, unknown>[];

    if (dados.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">Nenhum registro encontrado com os filtros selecionados</p>
        </div>
      );
    }

    switch (modulo) {
      case "processos":
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">N° Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Assunto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tribunal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Advogado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Valor Causa</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Itens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((p: Record<string, unknown>) => {
                  const adv = p.advogado as Record<string, string> | null;
                  const count = p._count as Record<string, number>;
                  const fin = p.financeiro as Record<string, unknown> | null;
                  const statusLabelsMap: Record<string, string> = {
                    EM_ANDAMENTO: "Em Andamento", SUSPENSO: "Suspenso", ARQUIVADO: "Arquivado",
                    ENCERRADO: "Encerrado", AGUARDANDO_JULGAMENTO: "Aguardando Julgamento",
                  };
                  return (
                    <tr key={p.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-800">{p.numeroProcesso as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{p.assunto as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.tribunal as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{statusLabelsMap[p.status as string] || (p.status as string)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{adv ? `${adv.nome} (${adv.oab})` : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.valorCausa ? formatCurrency(Number(p.valorCausa)) : "—"}
                        {fin && <span className="block text-xs text-gray-400">Hon: {formatCurrency(Number(fin.honorariosContrato || 0))}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">
                        {count.partes}P / {count.movimentacoes}M / {count.documentos}D
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "clientes":
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">CPF/CNPJ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Telefone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Cidade/UF</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Processos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((c: Record<string, unknown>) => {
                  const count = c._count as Record<string, number>;
                  return (
                    <tr key={c.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{c.nome as string}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{c.cpfCnpj as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(c.email as string) || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(c.telefone as string) || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {c.cidade ? `${c.cidade}/${c.estado}` : (c.estado as string) || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{count.partesProcesso}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "financeiro":
        return (
          <>
            {resumo && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-blue-800">{formatCurrency(resumo.totalHonorarios ?? 0)}</p>
                  <p className="text-xs text-blue-600">Total Honorários</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-indigo-800">{formatCurrency(resumo.totalValorCausa ?? 0)}</p>
                  <p className="text-xs text-indigo-600">Total Valor Causa</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-gray-800">{resumo.totalParcelas ?? 0}</p>
                  <p className="text-xs text-gray-600">Total Parcelas</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-green-800">{formatCurrency(resumo.totalPago ?? 0)}</p>
                  <p className="text-xs text-green-600">Total Pago</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-amber-800">{formatCurrency(resumo.totalPendente ?? 0)}</p>
                  <p className="text-xs text-amber-600">Total Pendente</p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Processo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Prognóstico</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Honorários</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Valor Causa</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Parcelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dados.map((f: Record<string, unknown>) => {
                    const proc = f.processo as Record<string, string>;
                    const parcelas = f.parcelas as unknown[];
                    const progLabels: Record<string, string> = { PROVAVEL: "Provável", POSSIVEL: "Possível", REMOTA: "Remota" };
                    const progColors: Record<string, string> = {
                      PROVAVEL: "bg-red-100 text-red-700", POSSIVEL: "bg-yellow-100 text-yellow-700", REMOTA: "bg-green-100 text-green-700",
                    };
                    return (
                      <tr key={f.id as string} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <p className="font-mono text-gray-800">{proc.numeroProcesso}</p>
                          <p className="text-xs text-gray-500">{proc.assunto}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${progColors[f.prognostico as string] || ""}`}>
                            {progLabels[f.prognostico as string] || (f.prognostico as string)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(Number(f.honorariosContrato || 0))}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(Number(f.valorCausaEstimado || 0))}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{parcelas.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        );

      case "prazos":
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Período</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Testemunhas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((p: Record<string, unknown>) => {
                  const proc = p.processo as Record<string, string>;
                  const tests = p.testemunhas as { testemunha: { nome: string } }[];
                  const tipoLabelsMap: Record<string, string> = {
                    AUDIENCIA: "Audiência", PRAZO_PROCESSUAL: "Prazo", PERICIA: "Perícia",
                    SUSTENTACAO_ORAL: "Sustentação", OUTRO: "Outro",
                  };
                  const stLabels: Record<string, string> = { PENDENTE: "Pendente", CUMPRIDO: "Cumprido", PERDIDO: "Perdido" };
                  return (
                    <tr key={p.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{p.descricao as string}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{proc.numeroProcesso}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tipoLabelsMap[p.tipo as string] || (p.tipo as string)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(p.dataInicio as string).toLocaleDateString("pt-BR")} — {new Date(p.dataFim as string).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{stLabels[p.status as string] || (p.status as string)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tests.map((t) => t.testemunha.nome).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "procuracoes":
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Outorgante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Outorgado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Emissão</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Validade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((p: Record<string, unknown>) => {
                  const proc = p.processo as { numeroProcesso: string } | null;
                  const stColors: Record<string, string> = {
                    VIGENTE: "bg-green-100 text-green-700", VENCIDA: "bg-red-100 text-red-700", REVOGADA: "bg-gray-100 text-gray-500",
                  };
                  return (
                    <tr key={p.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{p.outorgante as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{p.outorgado as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{proc?.numeroProcesso || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.dataEmissao as string).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.dataValidade ? new Date(p.dataValidade as string).toLocaleDateString("pt-BR") : "Indeterminada"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stColors[p.status as string] || ""}`}>
                          {p.status as string}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "requisicoes":
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Título</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Solicitante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Área</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Prioridade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((r: Record<string, unknown>) => {
                  const areaMap: Record<string, string> = { CONTRATOS: "Contratos", CONSULTIVO: "Consultivo" };
                  const prioMap: Record<string, string> = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta", URGENTE: "Urgente" };
                  const stMap: Record<string, string> = {
                    ABERTA: "Aberta", EM_ANALISE: "Em Análise", EM_ANDAMENTO: "Em Andamento",
                    CONCLUIDA: "Concluída", CANCELADA: "Cancelada",
                  };
                  return (
                    <tr key={r.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">{r.numero as number}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 max-w-[250px] truncate">{r.titulo as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.solicitante as string}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{areaMap[r.area as string] || (r.area as string)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{prioMap[r.prioridade as string] || (r.prioridade as string)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{stMap[r.status as string] || (r.status as string)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.criadoEm as string).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Módulo</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(moduloLabels) as ModuloRelatorio[]).map((m) => (
              <button
                key={m}
                onClick={() => { setModulo(m); setResultado(null); setResumo(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  modulo === m
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {moduloLabels[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">{renderFiltros()}</div>

        <div className="flex items-center gap-4">
          <button
            onClick={gerarRelatorio}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Relatório"}
          </button>
          {resultado && (
            <span className="text-sm text-gray-500">
              {totalRegistros} registro(s) encontrado(s)
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400 text-lg">Gerando relatório...</p>
        </div>
      )}

      {!loading && resultado && renderResultado()}
    </div>
  );
}
