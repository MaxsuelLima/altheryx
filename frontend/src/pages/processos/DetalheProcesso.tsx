import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import TabCapa from "./tabs/TabCapa";
import TabPartes from "./tabs/TabPartes";
import TabMovimentacoes from "./tabs/TabMovimentacoes";
import TabDocumentos from "./tabs/TabDocumentos";
import TabFinanceiro from "./tabs/TabFinanceiro";
import Modal from "../../components/ui/Modal";
import FormProcesso from "./FormProcesso";

interface Processo {
  id: string;
  numeroProcesso: string;
  status: string;
  tribunal: string;
  competencia: string | null;
  assunto: string;
  valorCausa: string | null;
  segredoJustica: boolean;
  tutelaLiminar: boolean;
  ultimaMovimentacao: string | null;
  observacoes: string | null;
  advogado: { id: string; nome: string; oab: string } | null;
  juiz: { id: string; nome: string; tribunal: string | null; vara: string | null } | null;
  partes: {
    id: string;
    tipoParte: string;
    cliente: { id: string; nome: string; cpfCnpj: string };
  }[];
  movimentacoes: {
    id: string;
    data: string;
    descricao: string;
  }[];
}

const tabs = [
  { id: "capa", label: "Capa do Processo" },
  { id: "partes", label: "Partes" },
  { id: "movimentacoes", label: "Movimentações" },
  { id: "documentos", label: "Cópia Integral" },
  { id: "financeiro", label: "Financeiro" },
];

const statusLabels: Record<string, string> = {
  EM_ANDAMENTO: "Em Andamento",
  SUSPENSO: "Suspenso",
  ARQUIVADO: "Arquivado",
  ENCERRADO: "Encerrado",
  AGUARDANDO_JULGAMENTO: "Aguardando Julgamento",
};

const statusColors: Record<string, string> = {
  EM_ANDAMENTO: "bg-info-light text-info",
  SUSPENSO: "bg-warning-light text-warning",
  ARQUIVADO: "bg-theme-bg-tertiary text-theme-text-secondary",
  ENCERRADO: "bg-success-light text-success",
  AGUARDANDO_JULGAMENTO: "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]",
};

export default function DetalheProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [activeTab, setActiveTab] = useState("capa");
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const carregar = () => {
    if (!id) return;
    api
      .get(`/processos/${id}`)
      .then((res) => setProcesso(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  if (!processo) {
    return <div className="flex items-center justify-center h-64"><p className="text-danger text-lg">Processo não encontrado</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-theme-text-primary">
            Processo {processo.numeroProcesso}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[processo.status] || ""}`}>
              {statusLabels[processo.status] || processo.status}
            </span>
            {processo.segredoJustica && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-danger-light text-danger">
                Segredo de Justiça
              </span>
            )}
            {processo.tutelaLiminar && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-light text-warning">
                Tutela/Liminar
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
          >
            Editar Capa
          </button>
          <button
            onClick={() => navigate("/processos")}
            className="bg-theme-bg-tertiary text-theme-text-secondary px-4 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm font-medium"
          >
            Voltar
          </button>
        </div>
      </div>

      <div className="border-b border-theme-border-secondary mb-6">
        <nav className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-theme-text-tertiary hover:text-theme-text-secondary hover:border-theme-border-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "capa" && <TabCapa processo={processo} />}
      {activeTab === "partes" && <TabPartes processoId={processo.id} partes={processo.partes} onUpdate={carregar} />}
      {activeTab === "movimentacoes" && <TabMovimentacoes processoId={processo.id} movimentacoes={processo.movimentacoes} onUpdate={carregar} />}
      {activeTab === "documentos" && <TabDocumentos processoId={processo.id} />}
      {activeTab === "financeiro" && <TabFinanceiro processoId={processo.id} />}

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Capa do Processo" maxWidth="max-w-4xl">
        <FormProcesso
          editId={processo.id}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => { setEditModalOpen(false); carregar(); }}
        />
      </Modal>
    </div>
  );
}
