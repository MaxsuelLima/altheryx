import { useState } from "react";
import { api } from "../../../lib/api";

interface Movimentacao {
  id: string;
  data: string;
  descricao: string;
}

export default function TabMovimentacoes({
  processoId,
  movimentacoes,
  onUpdate,
}: {
  processoId: string;
  movimentacoes: Movimentacao[];
  onUpdate: () => void;
}) {
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [adding, setAdding] = useState(false);

  const adicionar = async () => {
    if (!data || !descricao.trim()) return;
    setAdding(true);
    try {
      await api.post(`/processos/${processoId}/movimentacoes`, { data, descricao });
      setData("");
      setDescricao("");
      onUpdate();
    } finally {
      setAdding(false);
    }
  };

  const excluir = async (movId: string) => {
    if (!confirm("Excluir esta movimentação?")) return;
    await api.delete(`/processos/${processoId}/movimentacoes/${movId}`);
    onUpdate();
  };

  const formatDate = (val: string) => {
    return new Date(val).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nova Movimentação</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da movimentação..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button
            onClick={adicionar}
            disabled={adding || !data || !descricao.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Histórico de Movimentações ({movimentacoes.length})
        </h3>
        {movimentacoes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma movimentação registrada</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {movimentacoes.map((mov) => (
                <div key={mov.id} className="relative pl-10">
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow" />
                  <div className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary-600">
                        {formatDate(mov.data)}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{mov.descricao}</p>
                    </div>
                    <button
                      onClick={() => excluir(mov.id)}
                      className="text-red-400 hover:text-red-600 text-xs ml-4 shrink-0"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
