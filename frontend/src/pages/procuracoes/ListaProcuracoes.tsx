import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

interface Procuracao {
  id: string;
  outorgante: string;
  outorgado: string;
  poderes: string;
  dataEmissao: string;
  dataValidade: string | null;
  status: string;
  observacoes: string | null;
  processo: { id: string; numeroProcesso: string } | null;
}

interface Alerta extends Procuracao {
  diasRestantes: number | null;
  vencida: boolean;
}

const statusLabels: Record<string, string> = {
  VIGENTE: "Vigente",
  VENCIDA: "Vencida",
  REVOGADA: "Revogada",
};

const statusColors: Record<string, string> = {
  VIGENTE: "bg-green-100 text-green-700",
  VENCIDA: "bg-red-100 text-red-700",
  REVOGADA: "bg-gray-100 text-gray-600",
};

export default function ListaProcuracoes() {
  const navigate = useNavigate();
  const [procuracoes, setProcuracoes] = useState<Procuracao[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const carregar = () => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (filtroStatus) params.set("status", filtroStatus);

    Promise.all([
      api.get(`/procuracoes?${params}`),
      api.get("/procuracoes/alertas"),
    ])
      .then(([procRes, alertaRes]) => {
        setProcuracoes(procRes.data);
        setAlertas(alertaRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [busca, filtroStatus]);

  const excluir = async (id: string) => {
    if (!confirm("Excluir esta procuração?")) return;
    await api.delete(`/procuracoes/${id}`);
    carregar();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Procurações</h2>
        <button
          onClick={() => navigate("/procuracoes/novo")}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Nova Procuração
        </button>
      </div>

      {alertas.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">
            Alertas de Renovação ({alertas.length})
          </h3>
          <div className="space-y-2">
            {alertas.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-amber-100">
                <div>
                  <span className="text-sm font-medium text-gray-800">
                    {a.outorgante} → {a.outorgado}
                  </span>
                  {a.processo && (
                    <span className="text-xs text-gray-500 ml-2">({a.processo.numeroProcesso})</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {a.vencida ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
                      Vencida
                    </span>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (a.diasRestantes ?? 0) <= 7 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {a.diasRestantes} dias restantes
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/procuracoes/${a.id}`)}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por outorgante, outorgado ou poderes..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
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

      {procuracoes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-400 text-lg">Nenhuma procuração encontrada</p>
        </div>
      ) : (
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
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {procuracoes.map((p) => {
                const hoje = new Date();
                const venceEm30 =
                  p.dataValidade &&
                  p.status === "VIGENTE" &&
                  new Date(p.dataValidade).getTime() - hoje.getTime() < 30 * 24 * 60 * 60 * 1000;

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{p.outorgante}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{p.outorgado}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.processo?.numeroProcesso || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(p.dataEmissao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={venceEm30 ? "text-amber-600 font-medium" : "text-gray-600"}>
                        {p.dataValidade
                          ? new Date(p.dataValidade).toLocaleDateString("pt-BR")
                          : "Indeterminada"}
                      </span>
                      {venceEm30 && (
                        <span className="ml-1 text-xs text-amber-500">!</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || ""}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/procuracoes/${p.id}`)}
                          className="text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-200 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(p.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
