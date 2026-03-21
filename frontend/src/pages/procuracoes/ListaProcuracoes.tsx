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
  VIGENTE: "bg-success-light text-success",
  VENCIDA: "bg-danger-light text-danger",
  REVOGADA: "bg-theme-bg-tertiary text-theme-text-secondary",
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
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary">Procurações</h2>
        <button
          onClick={() => navigate("/procuracoes/novo")}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
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
              <div key={a.id} className="flex items-center justify-between bg-theme-input-bg rounded-lg px-4 py-2 border border-amber-100">
                <div>
                  <span className="text-sm font-medium text-theme-text-primary">
                    {a.outorgante} → {a.outorgado}
                  </span>
                  {a.processo && (
                    <span className="text-xs text-theme-text-tertiary ml-2">({a.processo.numeroProcesso})</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {a.vencida ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-danger-light0 text-white">
                      Vencida
                    </span>
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (a.diasRestantes ?? 0) <= 7 ? "bg-danger-light text-danger" : "bg-warning-light text-warning"
                    }`}>
                      {a.diasRestantes} dias restantes
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/procuracoes/${a.id}`)}
                    className="text-xs text-accent hover:text-accent-hover font-medium"
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
          className="flex-1 border border-theme-border-primary rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        />
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

      {procuracoes.length === 0 ? (
        <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
          <p className="text-theme-text-tertiary text-lg">Nenhuma procuração encontrada</p>
        </div>
      ) : (
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
                <th className="text-right px-4 py-3 text-xs font-semibold text-theme-text-secondary uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-table-border">
              {procuracoes.map((p) => {
                const hoje = new Date();
                const venceEm30 =
                  p.dataValidade &&
                  p.status === "VIGENTE" &&
                  new Date(p.dataValidade).getTime() - hoje.getTime() < 30 * 24 * 60 * 60 * 1000;

                return (
                  <tr key={p.id} className="hover:bg-theme-bg-tertiary">
                    <td className="px-4 py-3 text-sm text-theme-text-primary">{p.outorgante}</td>
                    <td className="px-4 py-3 text-sm text-theme-text-primary">{p.outorgado}</td>
                    <td className="px-4 py-3 text-sm text-theme-text-secondary">
                      {p.processo?.numeroProcesso || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-theme-text-secondary">
                      {new Date(p.dataEmissao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={venceEm30 ? "text-warning font-medium" : "text-theme-text-secondary"}>
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
                          className="text-xs bg-accent-light text-accent-hover px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(p.id)}
                          className="text-xs bg-danger-light text-danger px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
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
