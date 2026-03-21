import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";

interface Processo {
  id: string;
  numeroProcesso: string;
  status: string;
  tribunal: string;
  assunto: string;
  competencia: string | null;
  advogado: { id: string; nome: string; oab: string } | null;
  juiz: { id: string; nome: string } | null;
  _count: { partes: number; documentos: number; movimentacoes: number };
}

const statusLabels: Record<string, string> = {
  EM_ANDAMENTO: "Em Andamento",
  SUSPENSO: "Suspenso",
  ARQUIVADO: "Arquivado",
  ENCERRADO: "Encerrado",
  AGUARDANDO_JULGAMENTO: "Aguardando Julgamento",
};

const statusColors: Record<string, string> = {
  EM_ANDAMENTO: "bg-blue-100 text-blue-700",
  SUSPENSO: "bg-yellow-100 text-yellow-700",
  ARQUIVADO: "bg-gray-100 text-gray-600",
  ENCERRADO: "bg-green-100 text-green-700",
  AGUARDANDO_JULGAMENTO: "bg-purple-100 text-purple-700",
};

export default function ListaProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregar = () => {
    setLoading(true);
    api
      .get("/processos", {
        params: {
          busca: busca || undefined,
          status: filtroStatus || undefined,
        },
      })
      .then((res) => setProcessos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca, filtroStatus]);

  const excluir = async (item: Processo) => {
    if (!confirm(`Excluir processo "${item.numeroProcesso}"?`)) return;
    await api.delete(`/processos/${item.id}`);
    carregar();
  };

  return (
    <div>
      <PageHeader title="Processos" createLink="/processos/novo" createLabel="Novo Processo" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por número, assunto ou tribunal..." />
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "numeroProcesso", label: "Número" },
            {
              key: "status",
              label: "Status",
              render: (p) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || ""}`}>
                  {statusLabels[p.status] || p.status}
                </span>
              ),
            },
            { key: "tribunal", label: "Tribunal" },
            { key: "assunto", label: "Assunto" },
            {
              key: "advogado",
              label: "Advogado",
              render: (p) => p.advogado ? `${p.advogado.nome} (${p.advogado.oab})` : "—",
            },
            {
              key: "_count",
              label: "Docs",
              render: (p) => p._count.documentos,
            },
          ]}
          data={processos}
          onEdit={(p) => navigate(`/processos/${p.id}`)}
          onDelete={excluir}
        />
      )}
    </div>
  );
}
