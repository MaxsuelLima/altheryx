import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface InsightsData {
  kpis: {
    mrr: number;
    ltv: number;
    cac: number;
    receitaTotal: number;
    totalRecebido: number;
    totalPendente: number;
    parcelasPagas: number;
    parcelasPendentes: number;
    totalClientes: number;
    totalProcessos: number;
  };
  honorariosPorCompetencia: {
    competencia: string;
    totalProcessos: number;
    valorCausaMedio: number;
    honorarioMedio: number;
  }[];
  prognosticoDistribuicao: {
    provavel: number;
    possivel: number;
    remota: number;
  };
}

function formatCurrency(val: number) {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default function Insights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/financeiro/insights")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-lg">Carregando insights...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-lg">Erro ao carregar insights</p>
      </div>
    );
  }

  const totalPrognostico =
    data.prognosticoDistribuicao.provavel +
    data.prognosticoDistribuicao.possivel +
    data.prognosticoDistribuicao.remota;

  const progPct = (val: number) =>
    totalPrognostico > 0 ? Math.round((val / totalPrognostico) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Insights de Mercado</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">MRR</p>
          <p className="text-xs text-gray-400 mb-2">Receita Recorrente Mensal</p>
          <p className="text-2xl font-bold text-primary-700">{formatCurrency(data.kpis.mrr)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">LTV</p>
          <p className="text-xs text-gray-400 mb-2">Lifetime Value por Cliente</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(data.kpis.ltv)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">CAC</p>
          <p className="text-xs text-gray-400 mb-2">Custo de Aquisição</p>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(data.kpis.cac)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">LTV:CAC</p>
          <p className="text-xs text-gray-400 mb-2">Razão LTV/CAC</p>
          <p className="text-2xl font-bold text-indigo-700">
            {data.kpis.cac > 0 ? `${(data.kpis.ltv / data.kpis.cac).toFixed(1)}x` : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow p-5">
          <p className="text-xs text-blue-600 uppercase font-semibold">Receita Total</p>
          <p className="text-xl font-bold text-blue-800 mt-1">{formatCurrency(data.kpis.receitaTotal)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow p-5">
          <p className="text-xs text-green-600 uppercase font-semibold">Total Recebido</p>
          <p className="text-xl font-bold text-green-800 mt-1">{formatCurrency(data.kpis.totalRecebido)}</p>
          <p className="text-xs text-green-500 mt-1">{data.kpis.parcelasPagas} parcelas pagas</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg shadow p-5">
          <p className="text-xs text-yellow-600 uppercase font-semibold">Total Pendente</p>
          <p className="text-xl font-bold text-yellow-800 mt-1">{formatCurrency(data.kpis.totalPendente)}</p>
          <p className="text-xs text-yellow-500 mt-1">{data.kpis.parcelasPendentes} parcelas pendentes</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg shadow p-5">
          <p className="text-xs text-purple-600 uppercase font-semibold">Portfolio</p>
          <p className="text-xl font-bold text-purple-800 mt-1">{data.kpis.totalProcessos} processos</p>
          <p className="text-xs text-purple-500 mt-1">{data.kpis.totalClientes} clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Prognóstico</h3>
          {totalPrognostico === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum dado de prognóstico cadastrado</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-600 font-medium">Perda Provável</span>
                  <span className="text-gray-700">
                    {data.prognosticoDistribuicao.provavel} ({progPct(data.prognosticoDistribuicao.provavel)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${progPct(data.prognosticoDistribuicao.provavel)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-600 font-medium">Perda Possível</span>
                  <span className="text-gray-700">
                    {data.prognosticoDistribuicao.possivel} ({progPct(data.prognosticoDistribuicao.possivel)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${progPct(data.prognosticoDistribuicao.possivel)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600 font-medium">Perda Remota</span>
                  <span className="text-gray-700">
                    {data.prognosticoDistribuicao.remota} ({progPct(data.prognosticoDistribuicao.remota)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${progPct(data.prognosticoDistribuicao.remota)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-800">{totalPrognostico}</p>
                  <p className="text-xs text-gray-500">Total Analisados</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {progPct(data.prognosticoDistribuicao.provavel)}%
                  </p>
                  <p className="text-xs text-red-500">Risco Alto</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Honorários Médios por Competência
          </h3>
          {data.honorariosPorCompetencia.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {data.honorariosPorCompetencia.map((item) => (
                <div key={item.competencia} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">{item.competencia}</span>
                    <span className="text-xs text-gray-500">{item.totalProcessos} processo(s)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Valor Causa Médio</p>
                      <p className="text-sm font-medium text-gray-700">{formatCurrency(item.valorCausaMedio)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Honorário Médio</p>
                      <p className="text-sm font-medium text-primary-700">{formatCurrency(item.honorarioMedio)}</p>
                    </div>
                  </div>
                  {item.valorCausaMedio > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Honorário / Valor Causa:{" "}
                        <span className="font-medium text-indigo-600">
                          {((item.honorarioMedio / item.valorCausaMedio) * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
