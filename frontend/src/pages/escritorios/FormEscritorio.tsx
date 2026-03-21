import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import FormField from "../../components/FormField";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
].map((uf) => ({ value: uf, label: uf }));

const initialState = {
  nome: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
};

export default function FormEscritorio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      api.get(`/escritorios/${id}`).then((res) => {
        const e = res.data;
        setForm({
          nome: e.nome || "",
          cnpj: e.cnpj || "",
          email: e.email || "",
          telefone: e.telefone || "",
          endereco: e.endereco || "",
          cidade: e.cidade || "",
          estado: e.estado || "",
          cep: e.cep || "",
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
      email: form.email || null,
      telefone: form.telefone || null,
      endereco: form.endereco || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      cep: form.cep || null,
    };

    try {
      if (isEdit) {
        await api.put(`/escritorios/${id}`, payload);
      } else {
        await api.post("/escritorios", payload);
      }
      navigate("/escritorios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-theme-text-primary mb-6">
        {isEdit ? "Editar Escritório" : "Novo Escritório"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
          <FormField label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} required />
          <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} type="email" />
          <FormField label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
          <FormField label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
          <FormField label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
          <FormField label="Estado" name="estado" value={form.estado} onChange={handleChange} options={estadosBR} />
          <FormField label="CEP" name="cep" value={form.cep} onChange={handleChange} maxLength={9} />
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
            onClick={() => navigate("/escritorios")}
            className="bg-theme-bg-tertiary text-theme-text-secondary px-6 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
