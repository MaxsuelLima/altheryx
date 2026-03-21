import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormPreposto from "./FormPreposto";

interface Preposto {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  cargo: string | null;
  _count: { processos: number };
}

export default function ListaPrepostos() {
  const [prepostos, setPrepostos] = useState<Preposto[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api
      .get("/prepostos", { params: { busca: busca || undefined } })
      .then((res) => setPrepostos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const excluir = async (item: Preposto) => {
    if (!confirm(`Excluir preposto "${item.nome}"?`)) return;
    await api.delete(`/prepostos/${item.id}`);
    carregar();
  };

  const abrirModal = (id?: string) => { setEditId(id || null); setModalOpen(true); };
  const fecharModal = () => { setModalOpen(false); setEditId(null); };
  const onSuccess = () => { fecharModal(); carregar(); };

  return (
    <div>
      <PageHeader title="Prepostos" onCreate={() => abrirModal()} createLabel="Novo Preposto" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF ou empresa..." />
      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "empresa", label: "Empresa" },
            { key: "cargo", label: "Cargo" },
            { key: "cpf", label: "CPF" },
            { key: "email", label: "E-mail" },
            { key: "telefone", label: "Telefone" },
            { key: "_count", label: "Processos", render: (p: Preposto) => p._count.processos },
          ]}
          data={prepostos}
          onEdit={(p) => abrirModal(p.id)}
          onDelete={excluir}
        />
      )}

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Preposto" : "Novo Preposto"}>
        <FormPreposto editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
