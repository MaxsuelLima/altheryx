import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";

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
  const navigate = useNavigate();

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

  return (
    <div>
      <PageHeader title="Prepostos" createLink="/prepostos/novo" createLabel="Novo Preposto" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF ou empresa..." />
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
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
          onEdit={(p) => navigate(`/prepostos/${p.id}`)}
          onDelete={excluir}
        />
      )}
    </div>
  );
}
