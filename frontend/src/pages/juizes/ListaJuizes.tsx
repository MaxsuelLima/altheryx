import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormJuiz from "./FormJuiz";

interface Juiz {
  id: string;
  nome: string;
  tribunal: string | null;
  vara: string | null;
  email: string | null;
  ativo: boolean;
  _count: { processos: number };
}

export default function ListaJuizes() {
  const [juizes, setJuizes] = useState<Juiz[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api
      .get("/juizes", { params: { busca: busca || undefined } })
      .then((res) => setJuizes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const excluir = async (item: Juiz) => {
    if (!confirm(`Excluir juiz "${item.nome}"?`)) return;
    await api.delete(`/juizes/${item.id}`);
    carregar();
  };

  const abrirModal = (id?: string) => { setEditId(id || null); setModalOpen(true); };
  const fecharModal = () => { setModalOpen(false); setEditId(null); };
  const onSuccess = () => { fecharModal(); carregar(); };

  return (
    <div>
      <PageHeader title="Juízes" onCreate={() => abrirModal()} createLabel="Novo Juiz" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou tribunal..." />
      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "tribunal", label: "Tribunal" },
            { key: "vara", label: "Vara" },
            { key: "email", label: "E-mail" },
            { key: "_count", label: "Processos", render: (j) => j._count.processos },
            {
              key: "ativo",
              label: "Status",
              render: (j) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${j.ativo ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                  {j.ativo ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          data={juizes}
          onEdit={(j) => abrirModal(j.id)}
          onDelete={excluir}
        />
      )}

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Juiz" : "Novo Juiz"}>
        <FormJuiz editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
