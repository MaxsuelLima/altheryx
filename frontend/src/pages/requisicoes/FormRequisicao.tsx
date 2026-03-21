import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

const tiposPorArea: Record<string, { value: string; label: string }[]> = {
  CONTRATOS: [
    { value: "ELABORACAO_CONTRATO", label: "Elaboração de Contrato" },
    { value: "PARECER", label: "Parecer" },
    { value: "DISTRATO", label: "Distrato" },
  ],
  CONSULTIVO: [
    { value: "CONSULTIVO_PREVENTIVO", label: "Consultivo Preventivo" },
    { value: "CONSULTIVO_MATERIAL", label: "Consultivo Material" },
  ],
};

export default function FormRequisicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = !!id;

  const [form, setForm] = useState({
    solicitante: "",
    departamento: "",
    area: "CONTRATOS",
    tipo: "ELABORACAO_CONTRATO",
    prioridade: "MEDIA",
    status: "ABERTA",
    titulo: "",
    descricao: "",
    partesEnvolvidas: "",
    valorEnvolvido: "",
    prazoDesejado: "",
    responsavel: "",
    resposta: "",
  });

  useEffect(() => {
    if (id) {
      api.get(`/requisicoes/${id}`).then((res) => {
        const r = res.data;
        setForm({
          solicitante: r.solicitante,
          departamento: r.departamento,
          area: r.area,
          tipo: r.tipo,
          prioridade: r.prioridade,
          status: r.status,
          titulo: r.titulo,
          descricao: r.descricao,
          partesEnvolvidas: r.partesEnvolvidas || "",
          valorEnvolvido: r.valorEnvolvido ? String(r.valorEnvolvido) : "",
          prazoDesejado: r.prazoDesejado ? r.prazoDesejado.split("T")[0] ?? "" : "",
          responsavel: r.responsavel || "",
          resposta: r.resposta || "",
        });
      });
    }
  }, [id]);

  const handleAreaChange = (area: string) => {
    const tipos = tiposPorArea[area];
    setForm({
      ...form,
      area,
      tipo: tipos?.[0]?.value || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      partesEnvolvidas: form.partesEnvolvidas || null,
      valorEnvolvido: form.valorEnvolvido ? Number(form.valorEnvolvido) : null,
      prazoDesejado: form.prazoDesejado || null,
      responsavel: form.responsavel || null,
      resposta: form.resposta || null,
    };

    if (editando) {
      await api.put(`/requisicoes/${id}`, payload);
    } else {
      await api.post("/requisicoes", payload);
    }
    navigate("/requisicoes");
  };

  const tiposDisponiveis = tiposPorArea[form.area] || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editando ? "Editar Requisição" : "Nova Requisição ao Jurídico"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-indigo-800 mb-1">Dados do Solicitante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Solicitante *</label>
              <input
                type="text"
                value={form.solicitante}
                onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
              <input
                type="text"
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                placeholder="Ex: Comercial, RH, Financeiro"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
            <select
              value={form.area}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="CONTRATOS">Contratos</option>
              <option value="CONSULTIVO">Consultivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço *</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {tiposDisponiveis.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select
              value={form.prioridade}
              onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>

        {editando && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ABERTA">Aberta</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <input
                type="text"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                placeholder="Nome do advogado responsável"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título da Requisição *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada *</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={4}
            placeholder="Descreva com detalhes o serviço solicitado..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partes Envolvidas</label>
            <input
              type="text"
              value={form.partesEnvolvidas}
              onChange={(e) => setForm({ ...form, partesEnvolvidas: e.target.value })}
              placeholder="Nomes das partes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Envolvido (R$)</label>
            <input
              type="number"
              step="0.01"
              value={form.valorEnvolvido}
              onChange={(e) => setForm({ ...form, valorEnvolvido: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Desejado</label>
            <input
              type="date"
              value={form.prazoDesejado}
              onChange={(e) => setForm({ ...form, prazoDesejado: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {editando && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Resposta / Parecer do Jurídico</label>
            <textarea
              value={form.resposta}
              onChange={(e) => setForm({ ...form, resposta: e.target.value })}
              rows={4}
              placeholder="Resposta ou parecer do departamento jurídico..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            {editando ? "Atualizar" : "Enviar Requisição"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/requisicoes")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
