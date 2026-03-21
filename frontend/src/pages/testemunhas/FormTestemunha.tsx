import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useWorkspaceNavigate } from "../../hooks/useWorkspaceNavigate";
import FormField from "../../components/FormField";

const initialState = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  endereco: "",
  profissao: "",
};

interface FormTestemunhaProps {
  editId?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function FormTestemunha({ editId, onClose, onSuccess }: FormTestemunhaProps = {}) {
  const params = useParams();
  const navigate = useWorkspaceNavigate();
  const id = editId ?? params.id;
  const isModal = !!onClose;
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      api.get(`/testemunhas/${id}`).then((res) => {
        const t = res.data;
        setForm({
          nome: t.nome || "",
          cpf: t.cpf || "",
          email: t.email || "",
          telefone: t.telefone || "",
          endereco: t.endereco || "",
          profissao: t.profissao || "",
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
      endereco: form.endereco || null,
      profissao: form.profissao || null,
    };

    try {
      if (isEdit) {
        await api.put(`/testemunhas/${id}`, payload);
      } else {
        await api.post("/testemunhas", payload);
      }
      if (isModal) onSuccess?.();
      else navigate("/testemunhas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModal) onClose?.();
    else navigate("/testemunhas");
  };

  const content = (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
        <FormField label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
        <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} type="email" />
        <FormField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
        <FormField label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
        <FormField label="Profissão" name="profissao" value={form.profissao} onChange={handleChange} />
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
        {isEdit ? "Editar Testemunha" : "Nova Testemunha"}
      </h2>
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-3xl">
        {content}
      </div>
    </div>
  );
}
