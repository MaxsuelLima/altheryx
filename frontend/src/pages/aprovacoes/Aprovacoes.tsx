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
  PENDENTE: "bg-amber-100 text-amber-700",
  APROVADA: "bg-green-100 text-green-700",
  REJEITADA: "bg-red-100 text-red-700",
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
  CRIACAO: "bg-green-100 text-green-700",
  ATUALIZACAO: "bg-blue-100 text-blue-700",
  EXCLUSAO: "bg-red-100 text-red-700",
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
    <table className="w-full text-sm border border-gray-200 rounded">
      <thead>
        <tr className="bg-gray-50">
          <th className="text-left px-3 py-2 font-medium text-gray-600 w-1/4">Campo</th>
          {antes && <th className="text-left px-3 py-2 font-medium text-gray-600 w-3/8">Antes (De)</th>}
          {depois && <th className="text-left px-3 py-2 font-medium text-gray-600 w-3/8">Depois (Para)</th>}
        </tr>
      </thead>
      <tbody>
        {campos.map((key) => {
          const a = antes ? formatValue(antes[key]) : "—";
          const d = depois ? formatValue(depois[key]) : "—";
          const changed = a !== d;
          return (
            <tr key={key} className={changed ? "bg-yellow-50" : ""}>
              <td className="px-3 py-1.5 font-medium text-gray-700 border-t">{key}</td>
              {antes && <td className={`px-3 py-1.5 border-t ${changed ? "text-red-600 line-through" : "text-gray-600"}`}>{a}</td>}
              {depois && <td className={`px-3 py-1.5 border-t ${changed ? "text-green-700 font-medium" : "text-gray-600"}`}>{d}</td>}
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
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Auditoria e Aprovações</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("aprovacoes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "aprovacoes" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Aprovações Pendentes
        </button>
        <button
          onClick={() => setTab("auditoria")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "auditoria" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Histórico de Alterações
        </button>
      </div>

      {tab === "aprovacoes" && (
        <>
          {dashboard && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{dashboard.pendentes}</p>
                <p className="text-xs text-gray-500">Pendentes</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{dashboard.aprovadas}</p>
                <p className="text-xs text-gray-500">Aprovadas</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{dashboard.rejeitadas}</p>
                <p className="text-xs text-gray-500">Rejeitadas</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="PENDENTE">Pendentes</option>
              <option value="APROVADA">Aprovadas</option>
              <option value="REJEITADA">Rejeitadas</option>
              <option value="">Todas</option>
            </select>
          </div>

          {aprovacoes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-400 text-lg">Nenhuma aprovação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aprovacoes.map((aprov) => (
                <div key={aprov.id} className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{aprov.entidade}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[aprov.status] ?? ""}`}>
                          {statusLabels[aprov.status] ?? aprov.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-x-3">
                        <span>Solicitado por: {aprov.solicitadoPor}</span>
                        <span>Em: {new Date(aprov.criadoEm).toLocaleString("pt-BR")}</span>
                        {aprov.aprovadoPor && <span>Resolvido por: {aprov.aprovadoPor}</span>}
                        {aprov.motivoRejeicao && <span className="text-red-600">Motivo: {aprov.motivoRejeicao}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandido(expandido === aprov.id ? null : aprov.id)}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {expandido === aprov.id ? "Recolher" : "Ver Detalhes"}
                      </button>
                      {aprov.status === "PENDENTE" && (
                        <>
                          <button
                            onClick={() => aprovar(aprov.id)}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => setExpandido(aprov.id + "-rejeitar")}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {expandido === aprov.id && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Comparação De → Para:</p>
                      <DiffTable antes={aprov.dadosAtuais} depois={aprov.dadosPropostos} />
                    </div>
                  )}

                  {expandido === aprov.id + "-rejeitar" && (
                    <div className="mt-3 border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeição</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={motivoRejeicao}
                          onChange={(e) => setMotivoRejeicao(e.target.value)}
                          placeholder="Informe o motivo..."
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          onClick={() => rejeitar(aprov.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          Confirmar Rejeição
                        </button>
                        <button
                          onClick={() => { setExpandido(null); setMotivoRejeicao(""); }}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas as ações</option>
              <option value="CRIACAO">Criação</option>
              <option value="ATUALIZACAO">Atualização</option>
              <option value="EXCLUSAO">Exclusão</option>
            </select>
          </div>

          {auditorias.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-400 text-lg">Nenhum registro de auditoria encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditorias.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{log.entidade}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${acaoColors[log.acao] ?? ""}`}>
                          {acaoLabels[log.acao] ?? log.acao}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-x-3">
                        <span>Usuário: {log.usuario}</span>
                        <span>Em: {new Date(log.criadoEm).toLocaleString("pt-BR")}</span>
                        <span className="font-mono text-gray-400">ID: {log.entidadeId.slice(0, 8)}...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {expandido === log.id ? "Recolher" : "Ver Detalhes"}
                    </button>
                  </div>

                  {expandido === log.id && (
                    <div className="mt-3 border-t pt-3">
                      {log.acao === "CRIACAO" && log.dadosNovos && (
                        <>
                          <p className="text-sm font-medium text-gray-700 mb-2">Dados criados:</p>
                          <DiffTable antes={null} depois={log.dadosNovos} />
                        </>
                      )}
                      {log.acao === "ATUALIZACAO" && (
                        <>
                          <p className="text-sm font-medium text-gray-700 mb-2">Alterações (De → Para):</p>
                          <DiffTable antes={log.dadosAnteriores} depois={log.dadosNovos} />
                        </>
                      )}
                      {log.acao === "EXCLUSAO" && log.dadosAnteriores && (
                        <>
                          <p className="text-sm font-medium text-gray-700 mb-2">Dados excluídos:</p>
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
