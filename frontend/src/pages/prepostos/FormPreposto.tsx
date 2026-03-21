import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";

const initialState = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  empresa: "",
  cargo: "",
};

export default function FormPreposto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      api.get(`/prepostos/${id}`).then((res) => {
        const p = res.data;
        setForm({
          nome: p.nome || "",
          cpf: p.cpf || "",
          email: p.email || "",
          telefone: p.telefone || "",
          empresa: p.empresa || "",
          cargo: p.cargo || "",
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
      cpf: form.cpf || null,
      email: form.email || null,
      telefone: form.telefone || null,
      empresa: form.empresa || null,
      cargo: form.cargo || null,
    };

    try {
      if (isEdit) {
        await api.put(`/prepostos/${id}`, payload);
      } else {
        await api.post("/prepostos", payload);
      }
      navigate("/prepostos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? "Editar Preposto" : "Novo Preposto"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
          <FormField label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
          <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} type="email" />
          <FormField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
          <FormField label="Empresa" name="empresa" value={form.empresa} onChange={handleChange} />
          <FormField label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/prepostos")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
