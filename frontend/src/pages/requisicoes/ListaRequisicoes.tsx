import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

interface Requisicao {
  id: string;
  numero: number;
  solicitante: string;
  departamento: string;
  area: string;
  tipo: string;
  prioridade: string;
  status: string;
  titulo: string;
  descricao: string;
  prazoDesejado: string | null;
  responsavel: string | null;
  criadoEm: string;
}

interface Dashboard {
  total: number;
  porStatus: { status: string; quantidade: number }[];
  porArea: { area: string; quantidade: number }[];
  porPrioridade: { prioridade: string; quantidade: number }[];
}

const areaLabels: Record<string, string> = {
  CONTRATOS: "Contratos",
  CONSULTIVO: "Consultivo",
};

const tipoLabels: Record<string, string> = {
  ELABORACAO_CONTRATO: "Elaboração de Contrato",
  PARECER: "Parecer",
  DISTRATO: "Distrato",
  CONSULTIVO_PREVENTIVO: "Consultivo Preventivo",
  CONSULTIVO_MATERIAL: "Consultivo Material",
};

const prioridadeLabels: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

const prioridadeColors: Record<string, string> = {
  BAIXA: "bg-theme-bg-tertiary text-theme-text-secondary",
  MEDIA: "bg-info-light text-info",
  ALTA: "bg-warning-light text-warning",
  URGENTE: "bg-danger-light text-danger",
};

const statusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em Análise",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const statusColors: Record<string, string> = {
  ABERTA: "bg-info-light text-info",
  EM_ANALISE: "bg-warning-light text-warning",
  EM_ANDAMENTO: "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]",
  CONCLUIDA: "bg-success-light text-success",
  CANCELADA: "bg-theme-bg-tertiary text-theme-text-tertiary",
};

export default function ListaRequisicoes() {
  const navigate = useNavigate();
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroArea, setFiltroArea] = useState("");

  const carregar = () => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (filtroStatus) params.set("status", filtroStatus);
    if (filtroArea) params.set("area", filtroArea);

    Promise.all([
      api.get(`/requisicoes?${params}`),
      api.get("/requisicoes/dashboard"),
    ])
      .then(([reqRes, dashRes]) => {
        setRequisicoes(reqRes.data);
        setDashboard(dashRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [busca, filtroStatus, filtroArea]);

  const excluir = async (id: string) => {
    if (!confirm("Excluir esta requisição?")) return;
    await api.delete(`/requisicoes/${id}`);
    carregar();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary">Requisições ao Jurídico</h2>
        <button
          onClick={() => navigate("/requisicoes/novo")}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
        >
          Nova Requisição
        </button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-accent-hover">{dashboard.total}</p>
            <p className="text-xs text-theme-text-tertiary">Total</p>
          </div>
          {dashboard.porStatus
            .filter((s) => s.status !== "CANCELADA")
            .map((s) => (
              <div key={s.status} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-4 text-center">
                <p className="text-2xl font-bold text-theme-text-primary">{s.quantidade}</p>
                <p className="text-xs text-theme-text-tertiary">{statusLabels[s.status] || s.status}</p>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por título, solicitante, departamento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 min-w-[200px] border border-theme-border-primary rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        />
        <select
          value={filtroArea}
          onChange={(e) => setFiltroArea(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        >
          <option value="">Todas as áreas</option>
          {Object.entries(areaLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {requisicoes.length === 0 ? (
        <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
          <p className="text-theme-text-tertiary text-lg">Nenhuma requisição encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requisicoes.map((req) => (
            <div key={req.id} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-theme-text-tertiary font-mono">#{req.numero}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[req.status] || ""}`}>
                      {statusLabels[req.status] || req.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${prioridadeColors[req.prioridade] || ""}`}>
                      {prioridadeLabels[req.prioridade] || req.prioridade}
                    </span>
                    <span className="bg-indigo-50 text-accent px-2 py-0.5 rounded text-xs font-medium">
                      {areaLabels[req.area] || req.area}
                    </span>
                    <span className="bg-theme-bg-tertiary text-theme-text-secondary px-2 py-0.5 rounded text-xs">
                      {tipoLabels[req.tipo] || req.tipo}
                    </span>
                  </div>
                  <h4 className="font-semibold text-theme-text-primary">{req.titulo}</h4>
                  <p className="text-sm text-theme-text-secondary mt-1 line-clamp-2">{req.descricao}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-theme-text-tertiary">
                    <span>Solicitante: {req.solicitante}</span>
                    <span>Depto: {req.departamento}</span>
                    {req.responsavel && <span>Responsável: {req.responsavel}</span>}
                    {req.prazoDesejado && (
                      <span>Prazo: {new Date(req.prazoDesejado).toLocaleDateString("pt-BR")}</span>
                    )}
                    <span>Criada em: {new Date(req.criadoEm).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/requisicoes/${req.id}`)}
                    className="text-xs bg-accent-light text-accent-hover px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(req.id)}
                    className="text-xs bg-danger-light text-danger px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
