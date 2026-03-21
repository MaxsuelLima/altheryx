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
  AUTOR: "bg-blue-100 text-blue-700",
  REU: "bg-red-100 text-red-700",
  TERCEIRO_INTERESSADO: "bg-yellow-100 text-yellow-700",
  ASSISTENTE: "bg-gray-100 text-gray-600",
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Parte</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
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
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {tipoOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={adicionar}
            disabled={adding || !clienteId}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CPF/CNPJ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma parte adicionada
                </td>
              </tr>
            ) : (
              partes.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{p.cliente.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.cliente.cpfCnpj}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoParteColors[p.tipoParte] || ""}`}>
                      {tipoParteLabels[p.tipoParte] || p.tipoParte}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remover(p.id, p.cliente.nome)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
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
