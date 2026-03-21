import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";

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
  const navigate = useNavigate();

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

  return (
    <div>
      <PageHeader title="Testemunhas" createLink="/testemunhas/novo" createLabel="Nova Testemunha" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou CPF..." />
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
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
          onEdit={(t) => navigate(`/testemunhas/${t.id}`)}
          onDelete={excluir}
        />
      )}
    </div>
  );
}
