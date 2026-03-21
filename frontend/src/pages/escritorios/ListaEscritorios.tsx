import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormEscritorio from "./FormEscritorio";

interface Escritorio {
  id: string;
  nome: string;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  _count: { advogados: number };
}

export default function ListaEscritorios() {
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api
      .get("/escritorios", { params: { busca: busca || undefined } })
      .then((res) => setEscritorios(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const excluir = async (item: Escritorio) => {
    if (!confirm(`Excluir escritório "${item.nome}"?`)) return;
    await api.delete(`/escritorios/${item.id}`);
    carregar();
  };

  const abrirModal = (id?: string) => { setEditId(id || null); setModalOpen(true); };
  const fecharModal = () => { setModalOpen(false); setEditId(null); };
  const onSuccess = () => { fecharModal(); carregar(); };

  return (
    <div>
      <PageHeader title="Escritórios" onCreate={() => abrirModal()} createLabel="Novo Escritório" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou CNPJ..." />
      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "cnpj", label: "CNPJ" },
            { key: "email", label: "E-mail" },
            { key: "telefone", label: "Telefone" },
            {
              key: "_count",
              label: "Advogados",
              render: (e) => e._count.advogados,
            },
            {
              key: "ativo",
              label: "Status",
              render: (e) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.ativo ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                  {e.ativo ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          data={escritorios}
          onEdit={(e) => abrirModal(e.id)}
          onDelete={excluir}
        />
      )}

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Escritório" : "Novo Escritório"}>
        <FormEscritorio editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
