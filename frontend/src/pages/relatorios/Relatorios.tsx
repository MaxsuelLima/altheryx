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
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Status</label>
              <select
                value={filtroProcesso.status}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, status: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
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
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Tribunal</label>
              <select
                value={filtroProcesso.tribunal}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, tribunal: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                {filtros?.tribunais.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Competência</label>
              <select
                value={filtroProcesso.competencia}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, competencia: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todas</option>
                {filtros?.competencias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Advogado</label>
              <select
                value={filtroProcesso.advogadoId}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, advogadoId: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                {filtros?.advogados.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome} ({a.oab})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Data Início</label>
              <input
                type="date"
                value={filtroProcesso.dataInicio}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Data Fim</label>
              <input
                type="date"
                value={filtroProcesso.dataFim}
                onChange={(e) => setFiltroProcesso({ ...filtroProcesso, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
          </div>
        );

      case "clientes":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Status</label>
              <select
                value={filtroCliente.ativo}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, ativo: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Estado (UF)</label>
              <select
                value={filtroCliente.estado}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, estado: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                {filtros?.estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Cadastrado De</label>
              <input
                type="date"
                value={filtroCliente.dataInicio}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Até</label>
              <input
                type="date"
                value={filtroCliente.dataFim}
                onChange={(e) => setFiltroCliente({ ...filtroCliente, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
          </div>
        );

      case "financeiro":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Prognóstico</label>
              <select
                value={filtroFinanceiro.prognostico}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, prognostico: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                <option value="PROVAVEL">Perda Provável</option>
                <option value="POSSIVEL">Perda Possível</option>
                <option value="REMOTA">Perda Remota</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Status Parcela</label>
              <select
                value={filtroFinanceiro.statusParcela}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, statusParcela: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGA">Paga</option>
                <option value="ATRASADA">Atrasada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Vencimento De</label>
              <input
                type="date"
                value={filtroFinanceiro.dataInicio}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Até</label>
              <input
                type="date"
                value={filtroFinanceiro.dataFim}
                onChange={(e) => setFiltroFinanceiro({ ...filtroFinanceiro, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
          </div>
        );

      case "prazos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Status</label>
              <select
                value={filtroPrazo.status}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, status: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CUMPRIDO">Cumprido</option>
                <option value="PERDIDO">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Tipo</label>
              <select
                value={filtroPrazo.tipo}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, tipo: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
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
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Data De</label>
              <input
                type="date"
                value={filtroPrazo.dataInicio}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Até</label>
              <input
                type="date"
                value={filtroPrazo.dataFim}
                onChange={(e) => setFiltroPrazo({ ...filtroPrazo, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
          </div>
        );

      case "procuracoes":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Status</label>
              <select
                value={filtroProcuracao.status}
                onChange={(e) => setFiltroProcuracao({ ...filtroProcuracao, status: e.target.value, vencendo: "" })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todos</option>
                <option value="VIGENTE">Vigente</option>
                <option value="VENCIDA">Vencida</option>
                <option value="REVOGADA">Revogada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Filtro Especial</label>
              <select
                value={filtroProcuracao.vencendo}
                onChange={(e) => setFiltroProcuracao({ ...filtroProcuracao, vencendo: e.target.value, status: "" })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
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
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Status</label>
              <select
                value={filtroRequisicao.status}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, status: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
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
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Área</label>
              <select
                value={filtroRequisicao.area}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, area: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Todas</option>
                <option value="CONTRATOS">Contratos</option>
                <option value="CONSULTIVO">Consultivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Criada De</label>
              <input
                type="date"
                value={filtroRequisicao.dataInicio}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Até</label>
              <input
                type="date"
                value={filtroRequisicao.dataFim}
                onChange={(e) => setFiltroRequisicao({ ...filtroRequisicao, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
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
        <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
          <p className="text-theme-text-tertiary text-lg">Nenhum registro encontrado com os filtros selecionados</p>
        </div>
      );
    }

    switch (modulo) {
      case "processos":
        return (
          <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-theme-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">N° Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Assunto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Tribunal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Advogado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Valor Causa</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Itens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-table-border">
                {dados.map((p: Record<string, unknown>) => {
                  const adv = p.advogado as Record<string, string> | null;
                  const count = p._count as Record<string, number>;
                  const fin = p.financeiro as Record<string, unknown> | null;
                  const statusLabelsMap: Record<string, string> = {
                    EM_ANDAMENTO: "Em Andamento", SUSPENSO: "Suspenso", ARQUIVADO: "Arquivado",
                    ENCERRADO: "Encerrado", AGUARDANDO_JULGAMENTO: "Aguardando Julgamento",
                  };
                  return (
                    <tr key={p.id as string} className="hover:bg-theme-bg-tertiary">
                      <td className="px-4 py-3 text-sm font-mono text-theme-text-primary">{p.numeroProcesso as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary max-w-[200px] truncate">{p.assunto as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{p.tribunal as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{statusLabelsMap[p.status as string] || (p.status as string)}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{adv ? `${adv.nome} (${adv.oab})` : "—"}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">
                        {p.valorCausa ? formatCurrency(Number(p.valorCausa)) : "—"}
                        {fin && <span className="block text-xs text-theme-text-tertiary">Hon: {formatCurrency(Number(fin.honorariosContrato || 0))}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-theme-text-tertiary">
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
          <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-theme-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">CPF/CNPJ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Telefone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Cidade/UF</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Processos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-table-border">
                {dados.map((c: Record<string, unknown>) => {
                  const count = c._count as Record<string, number>;
                  return (
                    <tr key={c.id as string} className="hover:bg-theme-bg-tertiary">
                      <td className="px-4 py-3 text-sm text-theme-text-primary">{c.nome as string}</td>
                      <td className="px-4 py-3 text-sm font-mono text-theme-text-secondary">{c.cpfCnpj as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{(c.email as string) || "—"}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{(c.telefone as string) || "—"}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">
                        {c.cidade ? `${c.cidade}/${c.estado}` : (c.estado as string) || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.ativo ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-theme-text-secondary">{count.partesProcesso}</td>
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
                <div className="bg-info-light rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-info">{formatCurrency(resumo.totalHonorarios ?? 0)}</p>
                  <p className="text-xs text-info">Total Honorários</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-indigo-800">{formatCurrency(resumo.totalValorCausa ?? 0)}</p>
                  <p className="text-xs text-accent">Total Valor Causa</p>
                </div>
                <div className="bg-theme-bg-tertiary rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-theme-text-primary">{resumo.totalParcelas ?? 0}</p>
                  <p className="text-xs text-theme-text-secondary">Total Parcelas</p>
                </div>
                <div className="bg-success-light rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-success">{formatCurrency(resumo.totalPago ?? 0)}</p>
                  <p className="text-xs text-success">Total Pago</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold text-amber-800">{formatCurrency(resumo.totalPendente ?? 0)}</p>
                  <p className="text-xs text-warning">Total Pendente</p>
                </div>
              </div>
            )}
            <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-theme-bg-tertiary">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Processo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Prognóstico</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Honorários</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Valor Causa</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Parcelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-table-border">
                  {dados.map((f: Record<string, unknown>) => {
                    const proc = f.processo as Record<string, string>;
                    const parcelas = f.parcelas as unknown[];
                    const progLabels: Record<string, string> = { PROVAVEL: "Provável", POSSIVEL: "Possível", REMOTA: "Remota" };
                    const progColors: Record<string, string> = {
                      PROVAVEL: "bg-danger-light text-danger", POSSIVEL: "bg-warning-light text-warning", REMOTA: "bg-success-light text-success",
                    };
                    return (
                      <tr key={f.id as string} className="hover:bg-theme-bg-tertiary">
                        <td className="px-4 py-3 text-sm">
                          <p className="font-mono text-theme-text-primary">{proc.numeroProcesso}</p>
                          <p className="text-xs text-theme-text-tertiary">{proc.assunto}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${progColors[f.prognostico as string] || ""}`}>
                            {progLabels[f.prognostico as string] || (f.prognostico as string)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{formatCurrency(Number(f.honorariosContrato || 0))}</td>
                        <td className="px-4 py-3 text-sm text-theme-text-secondary">{formatCurrency(Number(f.valorCausaEstimado || 0))}</td>
                        <td className="px-4 py-3 text-sm text-right text-theme-text-secondary">{parcelas.length}</td>
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
          <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-theme-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Período</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Testemunhas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-table-border">
                {dados.map((p: Record<string, unknown>) => {
                  const proc = p.processo as Record<string, string>;
                  const tests = p.testemunhas as { testemunha: { nome: string } }[];
                  const tipoLabelsMap: Record<string, string> = {
                    AUDIENCIA: "Audiência", PRAZO_PROCESSUAL: "Prazo", PERICIA: "Perícia",
                    SUSTENTACAO_ORAL: "Sustentação", OUTRO: "Outro",
                  };
                  const stLabels: Record<string, string> = { PENDENTE: "Pendente", CUMPRIDO: "Cumprido", PERDIDO: "Perdido" };
                  return (
                    <tr key={p.id as string} className="hover:bg-theme-bg-tertiary">
                      <td className="px-4 py-3 text-sm text-theme-text-primary">{p.descricao as string}</td>
                      <td className="px-4 py-3 text-sm font-mono text-theme-text-secondary">{proc.numeroProcesso}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{tipoLabelsMap[p.tipo as string] || (p.tipo as string)}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">
                        {new Date(p.dataInicio as string).toLocaleDateString("pt-BR")} — {new Date(p.dataFim as string).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{stLabels[p.status as string] || (p.status as string)}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{tests.map((t) => t.testemunha.nome).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "procuracoes":
        return (
          <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-theme-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Outorgante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Outorgado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Processo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Emissão</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Validade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-table-border">
                {dados.map((p: Record<string, unknown>) => {
                  const proc = p.processo as { numeroProcesso: string } | null;
                  const stColors: Record<string, string> = {
                    VIGENTE: "bg-success-light text-success", VENCIDA: "bg-danger-light text-danger", REVOGADA: "bg-theme-bg-tertiary text-theme-text-tertiary",
                  };
                  return (
                    <tr key={p.id as string} className="hover:bg-theme-bg-tertiary">
                      <td className="px-4 py-3 text-sm text-theme-text-primary">{p.outorgante as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-primary">{p.outorgado as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{proc?.numeroProcesso || "—"}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{new Date(p.dataEmissao as string).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">
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
          <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-theme-bg-tertiary">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Título</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Solicitante</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Área</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Prioridade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-table-border">
                {dados.map((r: Record<string, unknown>) => {
                  const areaMap: Record<string, string> = { CONTRATOS: "Contratos", CONSULTIVO: "Consultivo" };
                  const prioMap: Record<string, string> = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta", URGENTE: "Urgente" };
                  const stMap: Record<string, string> = {
                    ABERTA: "Aberta", EM_ANALISE: "Em Análise", EM_ANDAMENTO: "Em Andamento",
                    CONCLUIDA: "Concluída", CANCELADA: "Cancelada",
                  };
                  return (
                    <tr key={r.id as string} className="hover:bg-theme-bg-tertiary">
                      <td className="px-4 py-3 text-sm font-mono text-theme-text-tertiary">{r.numero as number}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-primary max-w-[250px] truncate">{r.titulo as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{r.solicitante as string}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{areaMap[r.area as string] || (r.area as string)}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{prioMap[r.prioridade as string] || (r.prioridade as string)}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{stMap[r.status as string] || (r.status as string)}</td>
                      <td className="px-4 py-3 text-sm text-theme-text-secondary">{new Date(r.criadoEm as string).toLocaleDateString("pt-BR")}</td>
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
      <h2 className="text-2xl font-bold text-theme-text-primary mb-6">Relatórios</h2>

      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-theme-text-secondary mb-2">Módulo</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(moduloLabels) as ModuloRelatorio[]).map((m) => (
              <button
                key={m}
                onClick={() => { setModulo(m); setResultado(null); setResumo(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  modulo === m
                    ? "bg-accent text-white"
                    : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-tertiary"
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
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Relatório"}
          </button>
          {resultado && (
            <span className="text-sm text-theme-text-tertiary">
              {totalRegistros} registro(s) encontrado(s)
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <p className="text-theme-text-tertiary text-lg">Gerando relatório...</p>
        </div>
      )}

      {!loading && resultado && renderResultado()}
    </div>
  );
}
