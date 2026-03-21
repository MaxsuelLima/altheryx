import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";

interface Escritorio {
  id: string;
  nome: string;
}

const initialState = {
  nome: "",
  oab: "",
  email: "",
  telefone: "",
  especialidade: "",
  escritorioId: "",
};

interface FormAdvogadoProps {
  editId?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function FormAdvogado({ editId, onClose, onSuccess }: FormAdvogadoProps = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const id = editId ?? params.id;
  const isModal = !!onClose;
  const [form, setForm] = useState(initialState);
  const [escritorios, setEscritorios] = useState<Escritorio[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    api.get("/escritorios").then((res) => setEscritorios(res.data));

    if (id) {
      api.get(`/advogados/${id}`).then((res) => {
        const a = res.data;
        setForm({
          nome: a.nome || "",
          oab: a.oab || "",
          email: a.email || "",
          telefone: a.telefone || "",
          especialidade: a.especialidade || "",
          escritorioId: a.escritorioId || "",
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
      email: form.email || null,
      telefone: form.telefone || null,
      especialidade: form.especialidade || null,
      escritorioId: form.escritorioId || null,
    };

    try {
      if (isEdit) {
        await api.put(`/advogados/${id}`, payload);
      } else {
        await api.post("/advogados", payload);
      }
      if (isModal) {
        onSuccess?.();
      } else {
        navigate("/advogados");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModal) onClose?.();
    else navigate("/advogados");
  };

  const content = (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
        <FormField label="OAB" name="oab" value={form.oab} onChange={handleChange} required placeholder="Ex: SP123456" />
        <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} type="email" />
        <FormField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
        <FormField label="Especialidade" name="especialidade" value={form.especialidade} onChange={handleChange} />
        <FormField
          label="Escritório"
          name="escritorioId"
          value={form.escritorioId}
          onChange={handleChange}
          options={escritorios.map((e) => ({ value: e.id, label: e.nome }))}
        />
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
        {isEdit ? "Editar Advogado" : "Novo Advogado"}
      </h2>
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-3xl">
        {content}
      </div>
    </div>
  );
}
