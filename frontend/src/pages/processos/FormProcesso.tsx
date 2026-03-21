import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";
import CustomCheckbox from "../../components/ui/CustomCheckbox";

interface Advogado { id: string; nome: string; oab: string }
interface Juiz { id: string; nome: string }

const statusOptions = [
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "SUSPENSO", label: "Suspenso" },
  { value: "ARQUIVADO", label: "Arquivado" },
  { value: "ENCERRADO", label: "Encerrado" },
  { value: "AGUARDANDO_JULGAMENTO", label: "Aguardando Julgamento" },
];

const initialState = {
  numeroProcesso: "",
  status: "EM_ANDAMENTO",
  tribunal: "",
  competencia: "",
  assunto: "",
  valorCausa: "",
  segredoJustica: false,
  tutelaLiminar: false,
  observacoes: "",
  advogadoId: "",
  juizId: "",
};

export default function FormProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [advogados, setAdvogados] = useState<Advogado[]>([]);
  const [juizes, setJuizes] = useState<Juiz[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    Promise.all([
      api.get("/advogados"),
      api.get("/juizes"),
    ]).then(([advRes, juizRes]) => {
      setAdvogados(advRes.data);
      setJuizes(juizRes.data);
    });

    if (id) {
      api.get(`/processos/${id}`).then((res) => {
        const p = res.data;
        setForm({
          numeroProcesso: p.numeroProcesso || "",
          status: p.status || "EM_ANDAMENTO",
          tribunal: p.tribunal || "",
          competencia: p.competencia || "",
          assunto: p.assunto || "",
          valorCausa: p.valorCausa ? String(p.valorCausa) : "",
          segredoJustica: p.segredoJustica || false,
          tutelaLiminar: p.tutelaLiminar || false,
          observacoes: p.observacoes || "",
          advogadoId: p.advogadoId || "",
          juizId: p.juizId || "",
        });
      });
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
      competencia: form.competencia || null,
      valorCausa: form.valorCausa ? parseFloat(form.valorCausa) : null,
      observacoes: form.observacoes || null,
      advogadoId: form.advogadoId || null,
      juizId: form.juizId || null,
    };

    try {
      if (isEdit) {
        await api.put(`/processos/${id}`, payload);
        navigate(`/processos/${id}`);
      } else {
        const res = await api.post("/processos", payload);
        navigate(`/processos/${res.data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-theme-text-primary mb-6">
        {isEdit ? "Editar Capa do Processo" : "Novo Processo"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Número do Processo" name="numeroProcesso" value={form.numeroProcesso} onChange={handleChange} required placeholder="0000000-00.0000.0.00.0000" />
          <FormField label="Status" name="status" value={form.status} onChange={handleChange} options={statusOptions} />
          <FormField label="Tribunal" name="tribunal" value={form.tribunal} onChange={handleChange} required />
          <FormField label="Competência" name="competencia" value={form.competencia} onChange={handleChange} placeholder="Ex: Cível, Trabalhista..." />
          <FormField label="Assunto" name="assunto" value={form.assunto} onChange={handleChange} required />
          <FormField label="Valor da Causa (R$)" name="valorCausa" value={form.valorCausa} onChange={handleChange} type="number" placeholder="0.00" />
          <FormField
            label="Advogado Responsável"
            name="advogadoId"
            value={form.advogadoId}
            onChange={handleChange}
            options={advogados.map((a) => ({ value: a.id, label: `${a.nome} (${a.oab})` }))}
          />
          <FormField
            label="Juiz"
            name="juizId"
            value={form.juizId}
            onChange={handleChange}
            options={juizes.map((j) => ({ value: j.id, label: j.nome }))}
          />
        </div>

        <div className="flex gap-6 mt-4">
          <CustomCheckbox
            checked={form.segredoJustica}
            onChange={(checked) => setForm((prev) => ({ ...prev, segredoJustica: checked }))}
            label="Segredo de Justiça"
          />
          <CustomCheckbox
            checked={form.tutelaLiminar}
            onChange={(checked) => setForm((prev) => ({ ...prev, tutelaLiminar: checked }))}
            label="Tutela/Liminar"
          />
        </div>

        <div className="mt-4">
          <FormField label="Observações" name="observacoes" value={form.observacoes} onChange={handleChange} textarea />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/processos")}
            className="bg-theme-bg-tertiary text-theme-text-secondary px-6 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
