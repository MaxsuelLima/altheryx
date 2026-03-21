import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";

interface Advogado {
  id: string;
  nome: string;
  oab: string;
  email: string | null;
  telefone: string | null;
  especialidade: string | null;
  ativo: boolean;
  escritorio: { id: string; nome: string } | null;
}

export default function ListaAdvogados() {
  const [advogados, setAdvogados] = useState<Advogado[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregar = () => {
    setLoading(true);
    api
      .get("/advogados", { params: { busca: busca || undefined } })
      .then((res) => setAdvogados(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(carregar, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const excluir = async (item: Advogado) => {
    if (!confirm(`Excluir advogado "${item.nome}"?`)) return;
    await api.delete(`/advogados/${item.id}`);
    carregar();
  };

  return (
    <div>
      <PageHeader title="Advogados" createLink="/advogados/novo" createLabel="Novo Advogado" />
      <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome ou OAB..." />
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <DataTable
          columns={[
            { key: "nome", label: "Nome" },
            { key: "oab", label: "OAB" },
            { key: "especialidade", label: "Especialidade" },
            { key: "email", label: "E-mail" },
            {
              key: "escritorio",
              label: "Escritório",
              render: (a) => a.escritorio?.nome || "—",
            },
            {
              key: "ativo",
              label: "Status",
              render: (a) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {a.ativo ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          data={advogados}
          onEdit={(a) => navigate(`/advogados/${a.id}`)}
          onDelete={excluir}
        />
      )}
    </div>
  );
}
