import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

interface Parcela {
  id: string;
  numero: number;
  valor: string;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
  observacoes: string | null;
}

interface Financeiro {
  id: string;
  prognostico: string;
  valorCausaEstimado: string | null;
  honorariosContrato: string | null;
  honorariosExito: string | null;
  percentualExito: string | null;
  formaPagamento: string;
  observacoes: string | null;
  parcelas: Parcela[];
  processo: {
    numeroProcesso: string;
    valorCausa: string | null;
    assunto: string;
    competencia: string | null;
  };
}

const prognosticoOptions = [
  { value: "PROVAVEL", label: "Perda Provável" },
  { value: "POSSIVEL", label: "Perda Possível" },
  { value: "REMOTA", label: "Perda Remota" },
];

const formaPagamentoOptions = [
  { value: "A_VISTA", label: "À Vista" },
  { value: "PARCELADO", label: "Parcelado" },
  { value: "HONORARIOS_EXITO", label: "Honorários de Êxito" },
  { value: "MISTO", label: "Misto" },
];

const statusParcelaLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  ATRASADA: "Atrasada",
  CANCELADA: "Cancelada",
};

const statusParcelaColors: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  PAGA: "bg-green-100 text-green-700",
  ATRASADA: "bg-red-100 text-red-700",
  CANCELADA: "bg-gray-100 text-gray-500",
};

const prognosticoColors: Record<string, string> = {
  PROVAVEL: "bg-red-50 border-red-300 text-red-800",
  POSSIVEL: "bg-yellow-50 border-yellow-300 text-yellow-800",
  REMOTA: "bg-green-50 border-green-300 text-green-800",
};

function formatCurrency(val: string | number | null) {
  if (!val) return "R$ 0,00";
  const n = typeof val === "string" ? parseFloat(val) : val;
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatDate(val: string) {
  return new Date(val).toLocaleDateString("pt-BR");
}

export default function TabFinanceiro({ processoId }: { processoId: string }) {
  const [financeiro, setFinanceiro] = useState<Financeiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    prognostico: "POSSIVEL",
    valorCausaEstimado: "",
    honorariosContrato: "",
    honorariosExito: "",
    percentualExito: "",
    formaPagamento: "A_VISTA",
    observacoes: "",
  });

  const [showParcelaForm, setShowParcelaForm] = useState(false);
  const [parcelaForm, setParcelaForm] = useState({
    numero: "1",
    valor: "",
    dataVencimento: "",
    observacoes: "",
  });

  const carregar = () => {
    setLoading(true);
    api
      .get(`/financeiro/${processoId}`)
      .then((res) => {
        const f = res.data;
        setFinanceiro(f);
        setForm({
          prognostico: f.prognostico || "POSSIVEL",
          valorCausaEstimado: f.valorCausaEstimado ? String(f.valorCausaEstimado) : "",
          honorariosContrato: f.honorariosContrato ? String(f.honorariosContrato) : "",
          honorariosExito: f.honorariosExito ? String(f.honorariosExito) : "",
          percentualExito: f.percentualExito ? String(f.percentualExito) : "",
          formaPagamento: f.formaPagamento || "A_VISTA",
          observacoes: f.observacoes || "",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [processoId]);

  const salvar = async () => {
    setSaving(true);
    try {
      await api.put(`/financeiro/${processoId}`, {
        ...form,
        valorCausaEstimado: form.valorCausaEstimado ? parseFloat(form.valorCausaEstimado) : null,
        honorariosContrato: form.honorariosContrato ? parseFloat(form.honorariosContrato) : null,
        honorariosExito: form.honorariosExito ? parseFloat(form.honorariosExito) : null,
        percentualExito: form.percentualExito ? parseFloat(form.percentualExito) : null,
        observacoes: form.observacoes || null,
      });
      carregar();
    } finally {
      setSaving(false);
    }
  };

  const adicionarParcela = async () => {
    if (!parcelaForm.valor || !parcelaForm.dataVencimento) return;
    try {
      await api.post(`/financeiro/${processoId}/parcelas`, {
        numero: parseInt(parcelaForm.numero),
        valor: parseFloat(parcelaForm.valor),
        dataVencimento: parcelaForm.dataVencimento,
        observacoes: parcelaForm.observacoes || null,
      });
      setShowParcelaForm(false);
      setParcelaForm({ numero: "1", valor: "", dataVencimento: "", observacoes: "" });
      carregar();
    } catch {
      alert("Erro ao adicionar parcela");
    }
  };

  const marcarPaga = async (parcela: Parcela) => {
    await api.put(`/financeiro/${processoId}/parcelas/${parcela.id}`, {
      status: "PAGA",
      dataPagamento: new Date().toISOString(),
    });
    carregar();
  };

  const excluirParcela = async (parcela: Parcela) => {
    if (!confirm(`Excluir parcela ${parcela.numero}?`)) return;
    await api.delete(`/financeiro/${processoId}/parcelas/${parcela.id}`);
    carregar();
  };

  if (loading) return <p className="text-gray-400">Carregando...</p>;

  const parcelas = financeiro?.parcelas || [];
  const totalPago = parcelas
    .filter((p) => p.status === "PAGA")
    .reduce((acc, p) => acc + parseFloat(p.valor), 0);
  const totalPendente = parcelas
    .filter((p) => p.status === "PENDENTE" || p.status === "ATRASADA")
    .reduce((acc, p) => acc + parseFloat(p.valor), 0);

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border-2 p-4 ${prognosticoColors[form.prognostico] || "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {form.prognostico === "PROVAVEL" ? "🔴" : form.prognostico === "POSSIVEL" ? "🟡" : "🟢"}
          </span>
          <div>
            <p className="font-semibold text-lg">
              Prognóstico: {prognosticoOptions.find((o) => o.value === form.prognostico)?.label}
            </p>
            <p className="text-sm opacity-75">
              Valor da causa: {formatCurrency(financeiro?.processo.valorCausa || null)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados Financeiros do Processo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prognóstico</label>
            <select
              value={form.prognostico}
              onChange={(e) => setForm((prev) => ({ ...prev, prognostico: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {prognosticoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Estimado da Causa (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.valorCausaEstimado}
              onChange={(e) => setForm((prev) => ({ ...prev, valorCausaEstimado: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Honorários Contratuais (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.honorariosContrato}
              onChange={(e) => setForm((prev) => ({ ...prev, honorariosContrato: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Honorários de Êxito (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.honorariosExito}
              onChange={(e) => setForm((prev) => ({ ...prev, honorariosExito: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Percentual de Êxito (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.percentualExito}
              onChange={(e) => setForm((prev) => ({ ...prev, percentualExito: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select
              value={form.formaPagamento}
              onChange={(e) => setForm((prev) => ({ ...prev, formaPagamento: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {formaPagamentoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações Financeiras</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="mt-4">
          <button
            onClick={salvar}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? "Salvando..." : "Salvar Dados Financeiros"}
          </button>
        </div>
      </div>

      {(form.formaPagamento === "PARCELADO" || form.formaPagamento === "MISTO") && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Controle de Parcelas</h3>
            <button
              onClick={() => setShowParcelaForm(!showParcelaForm)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {showParcelaForm ? "Cancelar" : "+ Nova Parcela"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-green-600 uppercase font-semibold">Total Pago</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(totalPago)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-xs text-yellow-600 uppercase font-semibold">Total Pendente</p>
              <p className="text-xl font-bold text-yellow-700">{formatCurrency(totalPendente)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-blue-600 uppercase font-semibold">Total Geral</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(totalPago + totalPendente)}</p>
            </div>
          </div>

          {showParcelaForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N.o Parcela</label>
                  <input
                    type="number"
                    min="1"
                    value={parcelaForm.numero}
                    onChange={(e) => setParcelaForm((prev) => ({ ...prev, numero: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={parcelaForm.valor}
                    onChange={(e) => setParcelaForm((prev) => ({ ...prev, valor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={parcelaForm.dataVencimento}
                    onChange={(e) => setParcelaForm((prev) => ({ ...prev, dataVencimento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={adicionarParcela}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N.o</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pagamento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parcelas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Nenhuma parcela cadastrada
                    </td>
                  </tr>
                ) : (
                  parcelas.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{p.numero}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(p.valor)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(p.dataVencimento)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {p.dataPagamento ? formatDate(p.dataPagamento) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusParcelaColors[p.status] || ""}`}>
                          {statusParcelaLabels[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {(p.status === "PENDENTE" || p.status === "ATRASADA") && (
                          <button
                            onClick={() => marcarPaga(p)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => excluirParcela(p)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
