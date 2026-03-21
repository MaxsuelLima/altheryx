import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Prazo {
  id: string;
  tipo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  status: string;
  observacoes: string | null;
  prepostoNome: string | null;
  prepostoContato: string | null;
  processo: { id: string; numeroProcesso: string; assunto: string };
  testemunhas: { id: string; testemunha: { id: string; nome: string } }[];
}

const tipoLabels: Record<string, string> = {
  AUDIENCIA: "Audiência",
  PRAZO_PROCESSUAL: "Prazo Processual",
  PERICIA: "Perícia",
  SUSTENTACAO_ORAL: "Sustentação Oral",
  OUTRO: "Outro",
};

const tipoColors: Record<string, string> = {
  AUDIENCIA: "bg-info-light text-info",
  PRAZO_PROCESSUAL: "bg-warning-light text-warning",
  PERICIA: "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]",
  SUSTENTACAO_ORAL: "bg-accent-light text-accent",
  OUTRO: "bg-theme-bg-tertiary text-theme-text-secondary",
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  CUMPRIDO: "Cumprido",
  PERDIDO: "Perdido",
};

const statusColors: Record<string, string> = {
  PENDENTE: "bg-warning-light text-warning",
  CUMPRIDO: "bg-success-light text-success",
  PERDIDO: "bg-danger-light text-danger",
};

export default function GestaoPrazos() {
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [mesAno, setMesAno] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [processos, setProcessos] = useState<{ id: string; numeroProcesso: string }[]>([]);
  const [testemunhas, setTestemunhas] = useState<{ id: string; nome: string }[]>([]);

  const [form, setForm] = useState({
    processoId: "",
    tipo: "AUDIENCIA",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    horaInicio: "",
    horaFim: "",
    local: "",
    observacoes: "",
    prepostoNome: "",
    prepostoContato: "",
    testemunhaIds: [] as string[],
  });

  const carregar = () => {
    const partes = mesAno.split("-");
    const ano = partes[0] || "";
    const mes = partes[1] || "";
    const params = new URLSearchParams({ mes, ano });
    if (filtroStatus) params.set("status", filtroStatus);
    if (filtroTipo) params.set("tipo", filtroTipo);

    api
      .get(`/prazos?${params}`)
      .then((res) => setPrazos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [mesAno, filtroStatus, filtroTipo]);

  useEffect(() => {
    api.get("/processos").then((res) => setProcessos(res.data));
    api.get("/testemunhas").then((res) => setTestemunhas(res.data));
  }, []);

  const resetForm = () => {
    setForm({
      processoId: "",
      tipo: "AUDIENCIA",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      horaInicio: "",
      horaFim: "",
      local: "",
      observacoes: "",
      prepostoNome: "",
      prepostoContato: "",
      testemunhaIds: [],
    });
    setEditandoId(null);
    setShowForm(false);
  };

  const handleEditar = (prazo: Prazo) => {
    setForm({
      processoId: prazo.processo.id,
      tipo: prazo.tipo,
      descricao: prazo.descricao,
      dataInicio: prazo.dataInicio.split("T")[0] ?? "",
      dataFim: prazo.dataFim.split("T")[0] ?? "",
      horaInicio: prazo.horaInicio || "",
      horaFim: prazo.horaFim || "",
      local: prazo.local || "",
      observacoes: prazo.observacoes || "",
      prepostoNome: prazo.prepostoNome || "",
      prepostoContato: prazo.prepostoContato || "",
      testemunhaIds: prazo.testemunhas.map((t) => t.testemunha.id),
    });
    setEditandoId(prazo.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      horaInicio: form.horaInicio || null,
      horaFim: form.horaFim || null,
      local: form.local || null,
      observacoes: form.observacoes || null,
      prepostoNome: form.prepostoNome || null,
      prepostoContato: form.prepostoContato || null,
    };

    if (editandoId) {
      await api.put(`/prazos/${editandoId}`, payload);
    } else {
      await api.post("/prazos", payload);
    }
    resetForm();
    carregar();
  };

  const marcarStatus = async (id: string, status: string) => {
    await api.patch(`/prazos/${id}/status`, { status });
    carregar();
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir este prazo?")) return;
    await api.delete(`/prazos/${id}`);
    carregar();
  };

  const toggleTestemunha = (tid: string) => {
    setForm((prev) => ({
      ...prev,
      testemunhaIds: prev.testemunhaIds.includes(tid)
        ? prev.testemunhaIds.filter((id) => id !== tid)
        : [...prev.testemunhaIds, tid],
    }));
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const isPrazoUrgente = (dataFim: string) => {
    const fim = new Date(dataFim);
    fim.setHours(0, 0, 0, 0);
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 3 && diff >= 0;
  };

  const isPrazoVencido = (dataFim: string, status: string) => {
    if (status === "CUMPRIDO") return false;
    const fim = new Date(dataFim);
    fim.setHours(0, 0, 0, 0);
    return fim < hoje;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary">Gestão de Prazos</h2>
        <button
          onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
        >
          {showForm ? "Cancelar" : "Novo Prazo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-4">
            {editandoId ? "Editar Prazo" : "Novo Prazo"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Processo *</label>
              <select
                value={form.processoId}
                onChange={(e) => setForm({ ...form, processoId: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              >
                <option value="">Selecione...</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>{p.numeroProcesso}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                {Object.entries(tipoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Descrição *</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Data Início *</label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Data Fim *</label>
              <input
                type="date"
                value={form.dataFim}
                onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">Hora Início</label>
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                  className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-1">Hora Fim</label>
                <input
                  type="time"
                  value={form.horaFim}
                  onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                  className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Local</label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Preposto</label>
              <input
                type="text"
                value={form.prepostoNome}
                onChange={(e) => setForm({ ...form, prepostoNome: e.target.value })}
                placeholder="Nome do preposto"
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Contato Preposto</label>
              <input
                type="text"
                value={form.prepostoContato}
                onChange={(e) => setForm({ ...form, prepostoContato: e.target.value })}
                placeholder="Telefone/email"
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={2}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              />
            </div>
            {testemunhas.length > 0 && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">Testemunhas Vinculadas</label>
                <div className="flex flex-wrap gap-2">
                  {testemunhas.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTestemunha(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        form.testemunhaIds.includes(t.id)
                          ? "bg-accent text-white"
                          : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-bg-tertiary"
                      }`}
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium">
              {editandoId ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="month"
          value={mesAno}
          onChange={(e) => setMesAno(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(tipoLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {prazos.length === 0 ? (
        <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
          <p className="text-theme-text-tertiary text-lg">Nenhum prazo encontrado para este período</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prazos.map((prazo) => {
            const vencido = isPrazoVencido(prazo.dataFim, prazo.status);
            const urgente = isPrazoUrgente(prazo.dataFim) && prazo.status === "PENDENTE";

            return (
              <div
                key={prazo.id}
                className={`bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-5 border-l-4 ${
                  vencido
                    ? "border-red-500"
                    : urgente
                    ? "border-orange-400"
                    : prazo.status === "CUMPRIDO"
                    ? "border-green-400"
                    : "border-accent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${tipoColors[prazo.tipo] || ""}`}>
                        {tipoLabels[prazo.tipo] || prazo.tipo}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[prazo.status] || ""}`}>
                        {statusLabels[prazo.status] || prazo.status}
                      </span>
                      {vencido && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-danger-light0 text-white">
                          Vencido
                        </span>
                      )}
                      {urgente && !vencido && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500 text-white">
                          Urgente
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-theme-text-primary">{prazo.descricao}</h4>
                    <p className="text-xs text-accent mt-1">
                      Processo: {prazo.processo.numeroProcesso}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-theme-text-secondary">
                      <span>
                        {new Date(prazo.dataInicio).toLocaleDateString("pt-BR")}
                        {prazo.horaInicio && ` ${prazo.horaInicio}`}
                        {" — "}
                        {new Date(prazo.dataFim).toLocaleDateString("pt-BR")}
                        {prazo.horaFim && ` ${prazo.horaFim}`}
                      </span>
                      {prazo.local && <span>| {prazo.local}</span>}
                    </div>
                    {prazo.prepostoNome && (
                      <p className="text-xs text-theme-text-tertiary mt-1">
                        Preposto: {prazo.prepostoNome}
                        {prazo.prepostoContato && ` (${prazo.prepostoContato})`}
                      </p>
                    )}
                    {prazo.testemunhas.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {prazo.testemunhas.map((t) => (
                          <span key={t.id} className="bg-theme-bg-tertiary text-theme-text-secondary px-2 py-0.5 rounded text-xs">
                            {t.testemunha.nome}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {prazo.status === "PENDENTE" && (
                      <button
                        onClick={() => marcarStatus(prazo.id, "CUMPRIDO")}
                        className="text-xs bg-success-light text-success px-3 py-1.5 rounded-lg hover:bg-success-light transition-colors"
                      >
                        Cumprido
                      </button>
                    )}
                    <button
                      onClick={() => handleEditar(prazo)}
                      className="text-xs bg-accent-light text-accent-hover px-3 py-1.5 rounded-lg hover:bg-accent-light transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(prazo.id)}
                      className="text-xs bg-danger-light text-danger px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
