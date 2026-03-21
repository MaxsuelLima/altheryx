import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";
import Modal from "../../components/ui/Modal";
import FormCliente from "./FormCliente";

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
}

export default function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api
      .get("/clientes", { params: { busca: busca || undefined } })
      .then((res) => setClientes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const excluir = async (cliente: Cliente) => {
    if (!confirm(`Excluir cliente "${cliente.nome}"?`)) return;
    await api.delete(`/clientes/${cliente.id}`);
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
      <PageHeader title="Clientes" onCreate={() => abrirModal()} createLabel="Novo Cliente" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." />
      {loading ? (
        <p className="text-theme-text-tertiary">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "cpfCnpj", label: "CPF/CNPJ" },
            { key: "email", label: "E-mail" },
            { key: "telefone", label: "Telefone" },
            {
              key: "cidade",
              label: "Cidade/UF",
              render: (c) => (c.cidade ? `${c.cidade}/${c.estado || ""}` : ""),
            },
            {
              key: "ativo",
              label: "Status",
              render: (c) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.ativo ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}>
                  {c.ativo ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          data={clientes}
          onEdit={(c) => abrirModal(c.id)}
          onDelete={excluir}
        />
      )}

      <Modal open={modalOpen} onClose={fecharModal} title={editId ? "Editar Cliente" : "Novo Cliente"}>
        <FormCliente editId={editId} onClose={fecharModal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
