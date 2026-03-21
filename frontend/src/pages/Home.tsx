import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  Users,
  Scale,
  FileText,
  Building2,
  Gavel,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";

interface DashboardData {
  totais: {
    clientes: number;
    advogados: number;
    processos: number;
    escritorios: number;
    juizes: number;
    testemunhas: number;
  };
  processosPorStatus: { status: string; quantidade: number }[];
  processosPorCompetencia: { competencia: string; quantidade: number }[];
  processosPorTribunal: { tribunal: string; quantidade: number }[];
}

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
  ARQUIVADO: "bg-theme-bg-tertiary text-theme-text-tertiary",
  ENCERRADO: "bg-success-light text-success",
  AGUARDANDO_JULGAMENTO: "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]",
};

const barColors: Record<string, string> = {
  EM_ANDAMENTO: "bg-info",
  SUSPENSO: "bg-warning",
  ARQUIVADO: "bg-theme-text-tertiary",
  ENCERRADO: "bg-success",
  AGUARDANDO_JULGAMENTO: "bg-[#8b5cf6]",
};

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-theme-text-tertiary">
          <Activity size={20} className="animate-pulse" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-danger text-sm">Erro ao carregar dashboard</div>
      </div>
    );
  }

  const cards = [
    { label: "Clientes", value: data.totais.clientes, icon: <Users size={20} />, color: "text-info", bg: "bg-info-light" },
    { label: "Advogados", value: data.totais.advogados, icon: <Scale size={20} />, color: "text-accent", bg: "bg-accent-light" },
    { label: "Processos", value: data.totais.processos, icon: <FileText size={20} />, color: "text-success", bg: "bg-success-light" },
    { label: "Escritórios", value: data.totais.escritorios, icon: <Building2 size={20} />, color: "text-[#8b5cf6]", bg: "bg-[rgba(139,92,246,0.15)]" },
    { label: "Juízes", value: data.totais.juizes, icon: <Gavel size={20} />, color: "text-warning", bg: "bg-warning-light" },
    { label: "Testemunhas", value: data.totais.testemunhas, icon: <MessageSquare size={20} />, color: "text-danger", bg: "bg-danger-light" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-theme-text-primary">Dashboard</h2>
          <p className="text-sm text-theme-text-tertiary mt-1">Visão geral do escritório</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-theme-text-tertiary">
          <TrendingUp size={16} />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Bento Grid - Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-theme-card-border bg-theme-card-bg shadow-card p-4 flex flex-col gap-3 hover:border-theme-border-primary transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-theme-text-primary">{card.value}</p>
              <p className="text-xs text-theme-text-tertiary mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-theme-card-border bg-theme-card-bg shadow-card p-5">
          <h3 className="text-sm font-semibold text-theme-text-primary mb-4">Processos por Status</h3>
          {data.processosPorStatus.length === 0 ? (
            <p className="text-theme-text-tertiary text-sm">Nenhum processo cadastrado</p>
          ) : (
            <div className="space-y-3">
              {data.processosPorStatus.map((item) => {
                const maxVal = Math.max(...data.processosPorStatus.map((i) => i.quantidade));
                const pct = maxVal > 0 ? (item.quantidade / maxVal) * 100 : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[item.status] || ""}`}>
                        {statusLabels[item.status] || item.status}
                      </span>
                      <span className="font-semibold text-theme-text-primary tabular-nums">{item.quantidade}</span>
                    </div>
                    <div className="w-full bg-theme-bg-tertiary rounded-full h-1.5">
                      <div
                        className={`${barColors[item.status] || "bg-accent"} h-1.5 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-theme-card-border bg-theme-card-bg shadow-card p-5">
          <h3 className="text-sm font-semibold text-theme-text-primary mb-4">Processos por Competência</h3>
          {data.processosPorCompetencia.length === 0 ? (
            <p className="text-theme-text-tertiary text-sm">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {data.processosPorCompetencia.map((item) => {
                const maxVal = Math.max(...data.processosPorCompetencia.map((i) => i.quantidade));
                const pct = maxVal > 0 ? (item.quantidade / maxVal) * 100 : 0;
                return (
                  <div key={item.competencia}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-theme-text-secondary">{item.competencia}</span>
                      <span className="font-semibold text-theme-text-primary tabular-nums">{item.quantidade}</span>
                    </div>
                    <div className="w-full bg-theme-bg-tertiary rounded-full h-1.5">
                      <div
                        className="bg-success h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-theme-card-border bg-theme-card-bg shadow-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-theme-text-primary mb-4">Processos por Tribunal</h3>
          {data.processosPorTribunal.length === 0 ? (
            <p className="text-theme-text-tertiary text-sm">Nenhum dado disponível</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.processosPorTribunal.map((item) => (
                <div
                  key={item.tribunal}
                  className="flex items-center justify-between rounded-lg bg-theme-bg-tertiary px-4 py-3 border border-theme-border-secondary"
                >
                  <span className="text-sm text-theme-text-secondary truncate mr-3">{item.tribunal}</span>
                  <span className="shrink-0 bg-accent-light text-accent px-2.5 py-0.5 rounded-md text-xs font-semibold tabular-nums">
                    {item.quantidade}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
