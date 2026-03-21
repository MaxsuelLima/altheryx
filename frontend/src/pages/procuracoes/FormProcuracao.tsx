import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function FormProcuracao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = !!id;

  const [processos, setProcessos] = useState<{ id: string; numeroProcesso: string }[]>([]);
  const [form, setForm] = useState({
    processoId: "",
    outorgante: "",
    outorgado: "",
    poderes: "",
    dataEmissao: "",
    dataValidade: "",
    status: "VIGENTE",
    observacoes: "",
  });

  useEffect(() => {
    api.get("/processos").then((res) => setProcessos(res.data));

    if (id) {
      api.get(`/procuracoes/${id}`).then((res) => {
        const p = res.data;
        setForm({
          processoId: p.processo?.id || "",
          outorgante: p.outorgante,
          outorgado: p.outorgado,
          poderes: p.poderes,
          dataEmissao: p.dataEmissao.split("T")[0],
          dataValidade: p.dataValidade ? p.dataValidade.split("T")[0] : "",
          status: p.status,
          observacoes: p.observacoes || "",
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      processoId: form.processoId || null,
      dataValidade: form.dataValidade || null,
      observacoes: form.observacoes || null,
    };

    if (editando) {
      await api.put(`/procuracoes/${id}`, payload);
    } else {
      await api.post("/procuracoes", payload);
    }
    navigate("/procuracoes");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editando ? "Editar Procuração" : "Nova Procuração"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outorgante *</label>
            <input
              type="text"
              value={form.outorgante}
              onChange={(e) => setForm({ ...form, outorgante: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outorgado *</label>
            <input
              type="text"
              value={form.outorgado}
              onChange={(e) => setForm({ ...form, outorgado: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processo Vinculado</label>
            <select
              value={form.processoId}
              onChange={(e) => setForm({ ...form, processoId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Nenhum</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>{p.numeroProcesso}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="VIGENTE">Vigente</option>
              <option value="VENCIDA">Vencida</option>
              <option value="REVOGADA">Revogada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
            <input
              type="date"
              value={form.dataEmissao}
              onChange={(e) => setForm({ ...form, dataEmissao: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
            <input
              type="date"
              value={form.dataValidade}
              onChange={(e) => setForm({ ...form, dataValidade: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Poderes Conferidos *</label>
            <textarea
              value={form.poderes}
              onChange={(e) => setForm({ ...form, poderes: e.target.value })}
              rows={4}
              placeholder="Descreva os poderes conferidos na procuração..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            {editando ? "Atualizar" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/procuracoes")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
