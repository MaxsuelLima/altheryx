import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";
import CustomSelect from "../../components/ui/CustomSelect";

const initialState = {
  processoId: "",
  outorgante: "",
  outorgado: "",
  poderes: "",
  dataEmissao: "",
  dataValidade: "",
  status: "VIGENTE",
  observacoes: "",
};

interface FormProcuracaoProps {
  editId?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function FormProcuracao({ editId, onClose, onSuccess }: FormProcuracaoProps = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const id = editId ?? params.id;
  const isModal = !!onClose;
  const editando = !!id;

  const [processos, setProcessos] = useState<{ id: string; numeroProcesso: string }[]>([]);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

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
    } else {
      setForm(initialState);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      processoId: form.processoId || null,
      dataValidade: form.dataValidade || null,
      observacoes: form.observacoes || null,
    };

    try {
      if (editando) {
        await api.put(`/procuracoes/${id}`, payload);
      } else {
        await api.post("/procuracoes", payload);
      }
      if (isModal) onSuccess?.();
      else navigate("/procuracoes");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModal) onClose?.();
    else navigate("/procuracoes");
  };

  const content = (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Outorgante" name="outorgante" value={form.outorgante} onChange={handleChange} required />
        <FormField label="Outorgado" name="outorgado" value={form.outorgado} onChange={handleChange} required />
        <CustomSelect
          label="Processo Vinculado"
          name="processoId"
          value={form.processoId}
          onChange={(val) => setForm((prev) => ({ ...prev, processoId: val }))}
          options={processos.map((p) => ({ value: p.id, label: p.numeroProcesso }))}
          placeholder="Nenhum"
        />
        <CustomSelect
          label="Status"
          name="status"
          value={form.status}
          onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
          options={[
            { value: "VIGENTE", label: "Vigente" },
            { value: "VENCIDA", label: "Vencida" },
            { value: "REVOGADA", label: "Revogada" },
          ]}
        />
        <FormField label="Data de Emissão" name="dataEmissao" value={form.dataEmissao} onChange={handleChange} type="date" required />
        <FormField label="Data de Validade" name="dataValidade" value={form.dataValidade} onChange={handleChange} type="date" />
        <div className="md:col-span-2">
          <FormField label="Poderes Conferidos" name="poderes" value={form.poderes} onChange={handleChange} textarea required />
        </div>
        <div className="md:col-span-2">
          <FormField label="Observações" name="observacoes" value={form.observacoes} onChange={handleChange} textarea />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={loading} className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium">
          {loading ? "Salvando..." : editando ? "Atualizar" : "Salvar"}
        </button>
        <button type="button" onClick={handleCancel} className="bg-theme-bg-tertiary text-theme-text-secondary px-6 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm font-medium">
          Cancelar
        </button>
      </div>
    </form>
  );

  if (isModal) return content;

  return (
    <div>
      <h2 className="text-2xl font-bold text-theme-text-primary mb-6">
        {editando ? "Editar Procuração" : "Nova Procuração"}
      </h2>
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-3xl">
        {content}
      </div>
    </div>
  );
}
