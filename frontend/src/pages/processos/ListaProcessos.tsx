import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormProcesso from "./FormProcesso";

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
  EM_ANDAMENTO: "bg-info-light text-info",
  SUSPENSO: "bg-warning-light text-warning",
  ARQUIVADO: "bg-theme-bg-tertiary text-theme-text-secondary",
  ENCERRADO: "bg-success-light text-success",
  AGUARDANDO_JULGAMENTO: "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]",
};

export default function ListaProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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

  const abrirModal = (id?: string) => {
    setEditId(id || null);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const onSuccess = () => {
    fecharModal();
    carregar();
  };

  return (
    <div>
      <PageHeader title="Processos" onCreate={() => abrirModal()} createLabel="Novo Processo" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por número, assunto ou tribunal..." />
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2 border border-theme-border-primary rounded-lg text-sm focus:ring-2 focus:ring-accent-light outline-none"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
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

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Processo" : "Novo Processo"} maxWidth="max-w-4xl">
        <FormProcesso editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
