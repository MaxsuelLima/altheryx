import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

interface Parte {
  id: string;
  tipoParte: string;
  cliente: { id: string; nome: string; cpfCnpj: string };
}

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
}

const tipoParteLabels: Record<string, string> = {
  AUTOR: "Autor",
  REU: "Réu",
  TERCEIRO_INTERESSADO: "Terceiro Interessado",
  ASSISTENTE: "Assistente",
};

const tipoParteColors: Record<string, string> = {
  AUTOR: "bg-info-light text-info",
  REU: "bg-danger-light text-danger",
  TERCEIRO_INTERESSADO: "bg-warning-light text-warning",
  ASSISTENTE: "bg-theme-bg-tertiary text-theme-text-secondary",
};

const tipoOptions = [
  { value: "AUTOR", label: "Autor" },
  { value: "REU", label: "Réu" },
  { value: "TERCEIRO_INTERESSADO", label: "Terceiro Interessado" },
  { value: "ASSISTENTE", label: "Assistente" },
];

export default function TabPartes({
  processoId,
  partes,
  onUpdate,
}: {
  processoId: string;
  partes: Parte[];
  onUpdate: () => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [tipoParte, setTipoParte] = useState("AUTOR");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get("/clientes").then((res) => setClientes(res.data));
  }, []);

  const adicionar = async () => {
    if (!clienteId) return;
    setAdding(true);
    try {
      await api.post(`/processos/${processoId}/partes`, { clienteId, tipoParte });
      setClienteId("");
      onUpdate();
    } finally {
      setAdding(false);
    }
  };

  const remover = async (parteId: string, nome: string) => {
    if (!confirm(`Remover "${nome}" do processo?`)) return;
    await api.delete(`/processos/${processoId}/partes/${parteId}`);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Adicionar Parte</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="flex-1 px-3 py-2 border border-theme-border-primary rounded-lg text-sm focus:ring-2 focus:ring-accent-light outline-none"
          >
            <option value="">Selecione um cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.cpfCnpj})
              </option>
            ))}
          </select>
          <select
            value={tipoParte}
            onChange={(e) => setTipoParte(e.target.value)}
            className="px-3 py-2 border border-theme-border-primary rounded-lg text-sm focus:ring-2 focus:ring-accent-light outline-none"
          >
            {tipoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={adicionar}
            disabled={adding || !clienteId}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-theme-bg-tertiary border-b border-theme-border-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase">CPF/CNPJ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-text-secondary uppercase">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-theme-text-secondary uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-table-border">
            {partes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-theme-text-tertiary">
                  Nenhuma parte adicionada
                </td>
              </tr>
            ) : (
              partes.map((p) => (
                <tr key={p.id} className="hover:bg-theme-bg-tertiary">
                  <td className="px-4 py-3 text-sm text-theme-text-secondary">{p.cliente.nome}</td>
                  <td className="px-4 py-3 text-sm text-theme-text-secondary">{p.cliente.cpfCnpj}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoParteColors[p.tipoParte] || ""}`}>
                      {tipoParteLabels[p.tipoParte] || p.tipoParte}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remover(p.id, p.cliente.nome)}
                      className="text-danger hover:text-danger text-sm font-medium"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
