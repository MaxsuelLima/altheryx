import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import SearchBar from "../../components/SearchBar";
import DataTable from "../../components/DataTable";

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
  const navigate = useNavigate();

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

  return (
    <div>
      <PageHeader title="Peritos e Assistentes Técnicos" createLink="/peritos/novo" createLabel="Novo Perito" />

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchBar value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF ou especialidade..." />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Todos os tipos</option>
          <option value="PERITO">Perito</option>
          <option value="ASSISTENTE_TECNICO">Assistente Técnico</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
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
          onEdit={(p) => navigate(`/peritos/${p.id}`)}
          onDelete={excluir}
        />
      )}
    </div>
  );
}
