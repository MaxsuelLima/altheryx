import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Aprovacao {
  id: string;
  entidade: string;
  entidadeId: string;
  dadosAtuais: Record<string, unknown>;
  dadosPropostos: Record<string, unknown>;
  status: string;
  solicitadoPor: string;
  aprovadoPor: string | null;
  motivoRejeicao: string | null;
  criadoEm: string;
  resolvidoEm: string | null;
}

interface AuditLog {
  id: string;
  entidade: string;
  entidadeId: string;
  acao: string;
  dadosAnteriores: Record<string, unknown> | null;
  dadosNovos: Record<string, unknown> | null;
  usuario: string;
  criadoEm: string;
}

interface Dashboard {
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
}

const statusColors: Record<string, string> = {
  PENDENTE: "bg-warning-light text-warning",
  APROVADA: "bg-success-light text-success",
  REJEITADA: "bg-danger-light text-danger",
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

const acaoLabels: Record<string, string> = {
  CRIACAO: "Criação",
  ATUALIZACAO: "Atualização",
  EXCLUSAO: "Exclusão",
};

const acaoColors: Record<string, string> = {
  CRIACAO: "bg-success-light text-success",
  ATUALIZACAO: "bg-info-light text-info",
  EXCLUSAO: "bg-danger-light text-danger",
};

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Sim" : "Não";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function DiffTable({ antes, depois }: { antes: Record<string, unknown> | null; depois: Record<string, unknown> | null }) {
  if (!antes && !depois) return null;
  const keys = [...new Set([...Object.keys(antes || {}), ...Object.keys(depois || {})])];
  const camposIgnorar = ["id", "criadoEm", "atualizadoEm", "deletadoEm", "deletadoPor"];
  const camposVisiveis = keys.filter((k) => !camposIgnorar.includes(k));

  const camposAlterados = camposVisiveis.filter((k) => {
    const a = antes ? formatValue(antes[k]) : "—";
    const d = depois ? formatValue(depois[k]) : "—";
    return a !== d;
  });

  const campos = camposAlterados.length > 0 ? camposAlterados : camposVisiveis;

  return (
    <table className="w-full text-sm border border-theme-border-secondary rounded">
      <thead>
        <tr className="bg-theme-bg-tertiary">
          <th className="text-left px-3 py-2 font-medium text-theme-text-secondary w-1/4">Campo</th>
          {antes && <th className="text-left px-3 py-2 font-medium text-theme-text-secondary w-3/8">Antes (De)</th>}
          {depois && <th className="text-left px-3 py-2 font-medium text-theme-text-secondary w-3/8">Depois (Para)</th>}
        </tr>
      </thead>
      <tbody>
        {campos.map((key) => {
          const a = antes ? formatValue(antes[key]) : "—";
          const d = depois ? formatValue(depois[key]) : "—";
          const changed = a !== d;
          return (
            <tr key={key} className={changed ? "bg-warning-light" : ""}>
              <td className="px-3 py-1.5 font-medium text-theme-text-secondary border-t">{key}</td>
              {antes && <td className={`px-3 py-1.5 border-t ${changed ? "text-danger line-through" : "text-theme-text-secondary"}`}>{a}</td>}
              {depois && <td className={`px-3 py-1.5 border-t ${changed ? "text-success font-medium" : "text-theme-text-secondary"}`}>{d}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Aprovacoes() {
  const [tab, setTab] = useState<"aprovacoes" | "auditoria">("aprovacoes");
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([]);
  const [auditorias, setAuditorias] = useState<AuditLog[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("PENDENTE");
  const [filtroEntidade, setFiltroEntidade] = useState("");
  const [filtroAcao, setFiltroAcao] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const carregarAprovacoes = () => {
    const params = new URLSearchParams();
    if (filtroStatus) params.set("status", filtroStatus);

    Promise.all([
      api.get(`/aprovacoes?${params}`),
      api.get("/aprovacoes/dashboard"),
    ]).then(([res, dashRes]) => {
      setAprovacoes(res.data);
      setDashboard(dashRes.data);
    }).finally(() => setLoading(false));
  };

  const carregarAuditoria = () => {
    const params = new URLSearchParams();
    if (filtroEntidade) params.set("entidade", filtroEntidade);
    if (filtroAcao) params.set("acao", filtroAcao);
    params.set("limite", "100");

    api.get(`/auditoria?${params}`).then((res) => {
      setAuditorias(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    if (tab === "aprovacoes") {
      carregarAprovacoes();
    } else {
      carregarAuditoria();
    }
  }, [tab, filtroStatus, filtroEntidade, filtroAcao]);

  const aprovar = async (id: string) => {
    await api.post(`/aprovacoes/${id}/aprovar`);
    carregarAprovacoes();
  };

  const rejeitar = async (id: string) => {
    await api.post(`/aprovacoes/${id}/rejeitar`, { motivo: motivoRejeicao });
    setMotivoRejeicao("");
    setExpandido(null);
    carregarAprovacoes();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-theme-text-primary mb-6">Auditoria e Aprovações</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("aprovacoes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "aprovacoes" ? "bg-accent text-white" : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-hover"
          }`}
        >
          Aprovações Pendentes
        </button>
        <button
          onClick={() => setTab("auditoria")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "auditoria" ? "bg-accent text-white" : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-hover"
          }`}
        >
          Histórico de Alterações
        </button>
      </div>

      {tab === "aprovacoes" && (
        <>
          {dashboard && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-4 text-center">
                <p className="text-2xl font-bold text-warning">{dashboard.pendentes}</p>
                <p className="text-xs text-theme-text-tertiary">Pendentes</p>
              </div>
              <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-4 text-center">
                <p className="text-2xl font-bold text-success">{dashboard.aprovadas}</p>
                <p className="text-xs text-theme-text-tertiary">Aprovadas</p>
              </div>
              <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-4 text-center">
                <p className="text-2xl font-bold text-danger">{dashboard.rejeitadas}</p>
                <p className="text-xs text-theme-text-tertiary">Rejeitadas</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
            >
              <option value="PENDENTE">Pendentes</option>
              <option value="APROVADA">Aprovadas</option>
              <option value="REJEITADA">Rejeitadas</option>
              <option value="">Todas</option>
            </select>
          </div>

          {aprovacoes.length === 0 ? (
            <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
              <p className="text-theme-text-tertiary text-lg">Nenhuma aprovação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aprovacoes.map((aprov) => (
                <div key={aprov.id} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-theme-text-primary">{aprov.entidade}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[aprov.status] ?? ""}`}>
                          {statusLabels[aprov.status] ?? aprov.status}
                        </span>
                      </div>
                      <div className="text-xs text-theme-text-tertiary space-x-3">
                        <span>Solicitado por: {aprov.solicitadoPor}</span>
                        <span>Em: {new Date(aprov.criadoEm).toLocaleString("pt-BR")}</span>
                        {aprov.aprovadoPor && <span>Resolvido por: {aprov.aprovadoPor}</span>}
                        {aprov.motivoRejeicao && <span className="text-danger">Motivo: {aprov.motivoRejeicao}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandido(expandido === aprov.id ? null : aprov.id)}
                        className="text-xs bg-theme-bg-tertiary text-theme-text-secondary px-3 py-1.5 rounded-lg hover:bg-theme-bg-tertiary transition-colors"
                      >
                        {expandido === aprov.id ? "Recolher" : "Ver Detalhes"}
                      </button>
                      {aprov.status === "PENDENTE" && (
                        <>
                          <button
                            onClick={() => aprovar(aprov.id)}
                            className="text-xs bg-success-light text-success px-3 py-1.5 rounded-lg hover:bg-success-light transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => setExpandido(aprov.id + "-rejeitar")}
                            className="text-xs bg-danger-light text-danger px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {expandido === aprov.id && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm font-medium text-theme-text-secondary mb-2">Comparação De → Para:</p>
                      <DiffTable antes={aprov.dadosAtuais} depois={aprov.dadosPropostos} />
                    </div>
                  )}

                  {expandido === aprov.id + "-rejeitar" && (
                    <div className="mt-3 border-t pt-3">
                      <label className="block text-sm font-medium text-theme-text-secondary mb-1">Motivo da Rejeição</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={motivoRejeicao}
                          onChange={(e) => setMotivoRejeicao(e.target.value)}
                          placeholder="Informe o motivo..."
                          className="flex-1 border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                        />
                        <button
                          onClick={() => rejeitar(aprov.id)}
                          className="bg-danger text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          Confirmar Rejeição
                        </button>
                        <button
                          onClick={() => { setExpandido(null); setMotivoRejeicao(""); }}
                          className="bg-theme-bg-tertiary text-theme-text-secondary px-4 py-2 rounded-lg text-sm hover:bg-theme-bg-hover transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "auditoria" && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              value={filtroEntidade}
              onChange={(e) => setFiltroEntidade(e.target.value)}
              className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
            >
              <option value="">Todas as entidades</option>
              <option value="Cliente">Cliente</option>
              <option value="Escritorio">Escritório</option>
              <option value="Advogado">Advogado</option>
              <option value="Juiz">Juiz</option>
              <option value="Testemunha">Testemunha</option>
              <option value="Processo">Processo</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Parcela">Parcela</option>
              <option value="Movimentacao">Movimentação</option>
              <option value="Documento">Documento</option>
              <option value="Publicacao">Publicação</option>
              <option value="Prazo">Prazo</option>
              <option value="CalendarioTribunal">Calendário</option>
              <option value="Procuracao">Procuração</option>
              <option value="Requisicao">Requisição</option>
            </select>
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
            >
              <option value="">Todas as ações</option>
              <option value="CRIACAO">Criação</option>
              <option value="ATUALIZACAO">Atualização</option>
              <option value="EXCLUSAO">Exclusão</option>
            </select>
          </div>

          {auditorias.length === 0 ? (
            <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
              <p className="text-theme-text-tertiary text-lg">Nenhum registro de auditoria encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditorias.map((log) => (
                <div key={log.id} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-theme-text-primary">{log.entidade}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${acaoColors[log.acao] ?? ""}`}>
                          {acaoLabels[log.acao] ?? log.acao}
                        </span>
                      </div>
                      <div className="text-xs text-theme-text-tertiary space-x-3">
                        <span>Usuário: {log.usuario}</span>
                        <span>Em: {new Date(log.criadoEm).toLocaleString("pt-BR")}</span>
                        <span className="font-mono text-theme-text-tertiary">ID: {log.entidadeId.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                      className="text-xs bg-theme-bg-tertiary text-theme-text-secondary px-3 py-1.5 rounded-lg hover:bg-theme-bg-tertiary transition-colors"
                    >
                      {expandido === log.id ? "Recolher" : "Ver Detalhes"}
                    </button>
                  </div>

                  {expandido === log.id && (
                    <div className="mt-3 border-t pt-3">
                      {log.acao === "CRIACAO" && log.dadosNovos && (
                        <>
                          <p className="text-sm font-medium text-theme-text-secondary mb-2">Dados criados:</p>
                          <DiffTable antes={null} depois={log.dadosNovos} />
                        </>
                      )}
                      {log.acao === "ATUALIZACAO" && (
                        <>
                          <p className="text-sm font-medium text-theme-text-secondary mb-2">Alterações (De → Para):</p>
                          <DiffTable antes={log.dadosAnteriores} depois={log.dadosNovos} />
                        </>
                      )}
                      {log.acao === "EXCLUSAO" && log.dadosAnteriores && (
                        <>
                          <p className="text-sm font-medium text-theme-text-secondary mb-2">Dados excluídos:</p>
                          <DiffTable antes={log.dadosAnteriores} depois={null} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
