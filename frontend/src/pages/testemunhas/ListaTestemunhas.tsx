import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormTestemunha from "./FormTestemunha";

interface Testemunha {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  profissao: string | null;
}

export default function ListaTestemunhas() {
  const [testemunhas, setTestemunhas] = useState<Testemunha[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api
      .get("/testemunhas", { params: { busca: busca || undefined } })
      .then((res) => setTestemunhas(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const excluir = async (item: Testemunha) => {
    if (!confirm(`Excluir testemunha "${item.nome}"?`)) return;
    await api.delete(`/testemunhas/${item.id}`);
    carregar();
  };

  const abrirModal = (id?: string) => { setEditId(id || null); setModalOpen(true); };
  const fecharModal = () => { setModalOpen(false); setEditId(null); };
  const onSuccess = () => { fecharModal(); carregar(); };

  return (
    <div>
      <PageHeader title="Testemunhas" onCreate={() => abrirModal()} createLabel="Nova Testemunha" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou CPF..." />
      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "cpf", label: "CPF" },
            { key: "profissao", label: "Profissão" },
            { key: "email", label: "E-mail" },
            { key: "telefone", label: "Telefone" },
          ]}
          data={testemunhas}
          onEdit={(t) => abrirModal(t.id)}
          onDelete={excluir}
        />
      )}

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Testemunha" : "Nova Testemunha"}>
        <FormTestemunha editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
