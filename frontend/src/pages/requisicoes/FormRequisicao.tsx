import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useWorkspaceNavigate } from "../../hooks/useWorkspaceNavigate";
import FormField from "../../components/FormField";
import CustomSelect from "../../components/ui/CustomSelect";

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

const initialState = {
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
};

interface FormRequisicaoProps {
  editId?: string | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function FormRequisicao({ editId, onClose, onSuccess }: FormRequisicaoProps = {}) {
  const params = useParams();
  const navigate = useWorkspaceNavigate();
  const id = editId ?? params.id;
  const isModal = !!onClose;
  const editando = !!id;

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

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
    } else {
      setForm(initialState);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAreaChange = (area: string) => {
    const tipos = tiposPorArea[area];
    setForm((prev) => ({ ...prev, area, tipo: tipos?.[0]?.value || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      partesEnvolvidas: form.partesEnvolvidas || null,
      valorEnvolvido: form.valorEnvolvido ? Number(form.valorEnvolvido) : null,
      prazoDesejado: form.prazoDesejado || null,
      responsavel: form.responsavel || null,
      resposta: form.resposta || null,
    };

    try {
      if (editando) {
        await api.put(`/requisicoes/${id}`, payload);
      } else {
        await api.post("/requisicoes", payload);
      }
      if (isModal) onSuccess?.();
      else navigate("/requisicoes");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModal) onClose?.();
    else navigate("/requisicoes");
  };

  const tiposDisponiveis = tiposPorArea[form.area] || [];

  const content = (
    <form onSubmit={handleSubmit}>
      <div className="bg-accent-subtle rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-theme-text-primary mb-3">Dados do Solicitante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome do Solicitante" name="solicitante" value={form.solicitante} onChange={handleChange} required />
          <FormField label="Departamento" name="departamento" value={form.departamento} onChange={handleChange} required placeholder="Ex: Comercial, RH, Financeiro" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <CustomSelect
          label="Área"
          name="area"
          value={form.area}
          onChange={handleAreaChange}
          options={[
            { value: "CONTRATOS", label: "Contratos" },
            { value: "CONSULTIVO", label: "Consultivo" },
          ]}
          required
        />
        <CustomSelect
          label="Tipo de Serviço"
          name="tipo"
          value={form.tipo}
          onChange={(val) => setForm((prev) => ({ ...prev, tipo: val }))}
          options={tiposDisponiveis}
          required
        />
        <CustomSelect
          label="Prioridade"
          name="prioridade"
          value={form.prioridade}
          onChange={(val) => setForm((prev) => ({ ...prev, prioridade: val }))}
          options={[
            { value: "BAIXA", label: "Baixa" },
            { value: "MEDIA", label: "Média" },
            { value: "ALTA", label: "Alta" },
            { value: "URGENTE", label: "Urgente" },
          ]}
        />
      </div>

      {editando && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <CustomSelect
            label="Status"
            name="status"
            value={form.status}
            onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
            options={[
              { value: "ABERTA", label: "Aberta" },
              { value: "EM_ANALISE", label: "Em Análise" },
              { value: "EM_ANDAMENTO", label: "Em Andamento" },
              { value: "CONCLUIDA", label: "Concluída" },
              { value: "CANCELADA", label: "Cancelada" },
            ]}
          />
          <FormField label="Responsável" name="responsavel" value={form.responsavel} onChange={handleChange} placeholder="Nome do advogado responsável" />
        </div>
      )}

      <div className="mb-4">
        <FormField label="Título da Requisição" name="titulo" value={form.titulo} onChange={handleChange} required />
      </div>

      <div className="mb-4">
        <FormField label="Descrição Detalhada" name="descricao" value={form.descricao} onChange={handleChange} textarea required placeholder="Descreva com detalhes o serviço solicitado..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormField label="Partes Envolvidas" name="partesEnvolvidas" value={form.partesEnvolvidas} onChange={handleChange} placeholder="Nomes das partes" />
        <FormField label="Valor Envolvido (R$)" name="valorEnvolvido" value={form.valorEnvolvido} onChange={handleChange} type="number" />
        <FormField label="Prazo Desejado" name="prazoDesejado" value={form.prazoDesejado} onChange={handleChange} type="date" />
      </div>

      {editando && (
        <div className="mb-4">
          <FormField label="Resposta / Parecer do Jurídico" name="resposta" value={form.resposta} onChange={handleChange} textarea placeholder="Resposta ou parecer do departamento jurídico..." />
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={loading} className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium">
          {loading ? "Salvando..." : editando ? "Atualizar" : "Enviar Requisição"}
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
        {editando ? "Editar Requisição" : "Nova Requisição ao Jurídico"}
      </h2>
      <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 max-w-4xl">
        {content}
      </div>
    </div>
  );
}
