import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";

const initialState = {
  nome: "",
  tribunal: "",
  vara: "",
  email: "",
};

export default function FormJuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      api.get(`/juizes/${id}`).then((res) => {
        const j = res.data;
        setForm({
          nome: j.nome || "",
          tribunal: j.tribunal || "",
          vara: j.vara || "",
          email: j.email || "",
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
      tribunal: form.tribunal || null,
      vara: form.vara || null,
      email: form.email || null,
    };

    try {
      if (isEdit) {
        await api.put(`/juizes/${id}`, payload);
      } else {
        await api.post("/juizes", payload);
      }
      navigate("/juizes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-theme-text-primary mb-6">
        {isEdit ? "Editar Juiz" : "Novo Juiz"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
          <FormField label="Tribunal" name="tribunal" value={form.tribunal} onChange={handleChange} />
          <FormField label="Vara" name="vara" value={form.vara} onChange={handleChange} />
          <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} type="email" />
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
            onClick={() => navigate("/juizes")}
            className="bg-theme-bg-tertiary text-theme-text-secondary px-6 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
