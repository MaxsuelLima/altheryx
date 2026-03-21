import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormPerito from "./FormPerito";

interface Perito {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  tipo: string;
  especialidade: string | null;
  registroProfissional: string | null;
  _count: { processos: number };
}

const TIPO_LABELS: Record<string, string> = {
  PERITO: "Perito",
  ASSISTENTE_TECNICO: "Assistente Técnico",
};

export default function ListaPeritos() {
  const [peritos, setPeritos] = useState<Perito[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api
      .get("/peritos", { params: { busca: busca || undefined, tipo: filtroTipo || undefined } })
      .then((res) => setPeritos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca, filtroTipo]);

  const excluir = async (item: Perito) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await api.delete(`/peritos/${item.id}`);
    carregar();
  };

  const abrirModal = (id?: string) => { setEditId(id || null); setModalOpen(true); };
  const fecharModal = () => { setModalOpen(false); setEditId(null); };
  const onSuccess = () => { fecharModal(); carregar(); };

  return (
    <div>
      <PageHeader title="Peritos e Assistentes Técnicos" onCreate={() => abrirModal()} createLabel="Novo Perito" />

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF ou especialidade..." />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm bg-theme-input-bg"
        >
          <option value="">Todos os tipos</option>
          <option value="PERITO">Perito</option>
          <option value="ASSISTENTE_TECNICO">Assistente Técnico</option>
        </select>
      </div>

      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "tipo", label: "Tipo", render: (p: Perito) => TIPO_LABELS[p.tipo] || p.tipo },
            { key: "especialidade", label: "Especialidade" },
            { key: "registroProfissional", label: "Registro" },
            { key: "email", label: "E-mail" },
            { key: "telefone", label: "Telefone" },
            { key: "_count", label: "Processos", render: (p: Perito) => p._count.processos },
          ]}
          data={peritos}
          onEdit={(p) => abrirModal(p.id)}
          onDelete={excluir}
        />
      )}

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Perito" : "Novo Perito / Assistente Técnico"}>
        <FormPerito editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
