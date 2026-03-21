import { useEffect, useState } from "react";
import { api } from "../lib/api";

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
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-lg">Erro ao carregar dashboard</div>
      </div>
    );
  }

  const cards = [
    { label: "Clientes", value: data.totais.clientes, color: "bg-blue-500" },
    { label: "Advogados", value: data.totais.advogados, color: "bg-indigo-500" },
    { label: "Processos", value: data.totais.processos, color: "bg-green-500" },
    { label: "Escritórios", value: data.totais.escritorios, color: "bg-purple-500" },
    { label: "Juízes", value: data.totais.juizes, color: "bg-amber-500" },
    { label: "Testemunhas", value: data.totais.testemunhas, color: "bg-rose-500" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold`}>
              {card.value}
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de</p>
              <p className="text-lg font-semibold text-gray-800">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processos por Status</h3>
          {data.processosPorStatus.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum processo cadastrado</p>
          ) : (
            <div className="space-y-3">
              {data.processosPorStatus.map((item) => {
                const maxVal = Math.max(...data.processosPorStatus.map((i) => i.quantidade));
                const pct = maxVal > 0 ? (item.quantidade / maxVal) * 100 : 0;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{statusLabels[item.status] || item.status}</span>
                      <span className="font-medium text-gray-800">{item.quantidade}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processos por Competência</h3>
          {data.processosPorCompetencia.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {data.processosPorCompetencia.map((item) => {
                const maxVal = Math.max(...data.processosPorCompetencia.map((i) => i.quantidade));
                const pct = maxVal > 0 ? (item.quantidade / maxVal) * 100 : 0;
                return (
                  <div key={item.competencia}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.competencia}</span>
                      <span className="font-medium text-gray-800">{item.quantidade}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processos por Tribunal</h3>
          {data.processosPorTribunal.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.processosPorTribunal.map((item) => (
                <div key={item.tribunal} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-700">{item.tribunal}</span>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
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
