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
  BAIXA: "bg-gray-100 text-gray-600",
  MEDIA: "bg-blue-100 text-blue-700",
  ALTA: "bg-orange-100 text-orange-700",
  URGENTE: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em Análise",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const statusColors: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-700",
  EM_ANALISE: "bg-amber-100 text-amber-700",
  EM_ANDAMENTO: "bg-purple-100 text-purple-700",
  CONCLUIDA: "bg-green-100 text-green-700",
  CANCELADA: "bg-gray-100 text-gray-500",
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
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Requisições ao Jurídico</h2>
        <button
          onClick={() => navigate("/requisicoes/novo")}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Nova Requisição
        </button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-primary-700">{dashboard.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          {dashboard.porStatus
            .filter((s) => s.status !== "CANCELADA")
            .map((s) => (
              <div key={s.status} className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{s.quantidade}</p>
                <p className="text-xs text-gray-500">{statusLabels[s.status] || s.status}</p>
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
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <select
          value={filtroArea}
          onChange={(e) => setFiltroArea(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Todas as áreas</option>
          {Object.entries(areaLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {requisicoes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">Nenhuma requisição encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requisicoes.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{req.numero}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[req.status] || ""}`}>
                      {statusLabels[req.status] || req.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${prioridadeColors[req.prioridade] || ""}`}>
                      {prioridadeLabels[req.prioridade] || req.prioridade}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                      {areaLabels[req.area] || req.area}
                    </span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-xs">
                      {tipoLabels[req.tipo] || req.tipo}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800">{req.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{req.descricao}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                    className="text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(req.id)}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
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
