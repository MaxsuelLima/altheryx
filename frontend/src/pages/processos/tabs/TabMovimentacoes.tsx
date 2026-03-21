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
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Nova Movimentação</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="px-3 py-2 border border-theme-border-primary rounded-lg text-sm focus:ring-2 focus:ring-accent-light outline-none"
          />
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da movimentação..."
            className="flex-1 px-3 py-2 border border-theme-border-primary rounded-lg text-sm focus:ring-2 focus:ring-accent-light outline-none"
          />
          <button
            onClick={adicionar}
            disabled={adding || !data || !descricao.trim()}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6">
        <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
          Histórico de Movimentações ({movimentacoes.length})
        </h3>
        {movimentacoes.length === 0 ? (
          <p className="text-theme-text-tertiary text-sm">Nenhuma movimentação registrada</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-theme-bg-tertiary" />
            <div className="space-y-4">
              {movimentacoes.map((mov) => (
                <div key={mov.id} className="relative pl-10">
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-theme-card-bg shadow" />
                  <div className="bg-theme-bg-tertiary rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-accent">
                        {formatDate(mov.data)}
                      </span>
                      <p className="text-sm text-theme-text-secondary mt-1">{mov.descricao}</p>
                    </div>
                    <button
                      onClick={() => excluir(mov.id)}
                      className="text-danger hover:text-danger text-xs ml-4 shrink-0"
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
