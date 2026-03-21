import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";
import CustomSelect from "../../components/ui/CustomSelect";

const initialState = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  tipo: "PERITO",
  especialidade: "",
  registroProfissional: "",
};

interface FormPeritoProps {
  editId?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function FormPerito({ editId, onClose, onSuccess }: FormPeritoProps = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const id = editId ?? params.id;
  const isModal = !!onClose;
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      api.get(`/peritos/${id}`).then((res) => {
        const p = res.data;
        setForm({
          nome: p.nome || "",
          cpf: p.cpf || "",
          email: p.email || "",
          telefone: p.telefone || "",
          tipo: p.tipo || "PERITO",
          especialidade: p.especialidade || "",
          registroProfissional: p.registroProfissional || "",
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
      cpf: form.cpf || null,
      email: form.email || null,
      telefone: form.telefone || null,
      especialidade: form.especialidade || null,
      registroProfissional: form.registroProfissional || null,
    };

    try {
      if (isEdit) {
        await api.put(`/peritos/${id}`, payload);
      } else {
        await api.post("/peritos", payload);
      }
      if (isModal) onSuccess?.();
      else navigate("/peritos");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModal) onClose?.();
    else navigate("/peritos");
  };

  const content = (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
        <CustomSelect
          label="Tipo"
          name="tipo"
          value={form.tipo}
          onChange={(val) => setForm((prev) => ({ ...prev, tipo: val }))}
          options={[
            { value: "PERITO", label: "Perito" },
            { value: "ASSISTENTE_TECNICO", label: "Assistente Técnico" },
          ]}
        />
        <FormField label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
        <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} type="email" />
        <FormField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
        <FormField label="Especialidade" name="especialidade" value={form.especialidade} onChange={handleChange} />
        <FormField label="Registro Profissional" name="registroProfissional" value={form.registroProfissional} onChange={handleChange} />
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={loading} className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium">
          {loading ? "Salvando..." : "Salvar"}
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
        {isEdit ? "Editar Perito" : "Novo Perito / Assistente Técnico"}
      </h2>
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-3xl">
        {content}
      </div>
    </div>
  );
}
