import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";

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
  const navigate = useNavigate();

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

  return (
    <div>
      <PageHeader title="Juízes" createLink="/juizes/novo" createLabel="Novo Juiz" />
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
            {
              key: "_count",
              label: "Processos",
              render: (j) => j._count.processos,
            },
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
          onEdit={(j) => navigate(`/juizes/${j.id}`)}
          onDelete={excluir}
        />
      )}
    </div>
  );
}
