import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Trash2, Clock, MapPin } from "lucide-react";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/ui/Modal";

interface Evento {
  id: string;
  tribunal: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  tipo: string;
}

const tipoConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Recesso: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/30", dot: "bg-blue-500" },
  Feriado: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-500/30", dot: "bg-red-500" },
  "Suspensão de Prazos": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/30", dot: "bg-amber-500" },
  Plantão: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/30", dot: "bg-emerald-500" },
  Mutirão: { bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-500/30", dot: "bg-violet-500" },
};

const fallbackConfig = { bg: "bg-theme-bg-tertiary", text: "text-theme-text-secondary", border: "border-theme-border-primary", dot: "bg-theme-text-tertiary" };

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const mesesNome = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const tiposEvento = ["Recesso", "Feriado", "Suspensão de Prazos", "Plantão", "Mutirão", "Outro"];

export default function CalendarioTribunais() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tribunais, setTribunais] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroTribunal, setFiltroTribunal] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());

  const [form, setForm] = useState({
    tribunal: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    tipo: tiposEvento[0],
  });

  const carregar = () => {
    const params = new URLSearchParams({
      mes: String(mesAtual + 1),
      ano: String(anoAtual),
    });
    if (filtroTribunal) params.set("tribunal", filtroTribunal);

    api
      .get(`/calendario?${params}`)
      .then((res) => setEventos(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [mesAtual, anoAtual, filtroTribunal]);

  useEffect(() => {
    api.get("/calendario/tribunais").then((res) => setTribunais(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/calendario", form);
    setForm({ tribunal: "", descricao: "", dataInicio: "", dataFim: "", tipo: tiposEvento[0] });
    setShowForm(false);
    api.get("/calendario/tribunais").then((res) => setTribunais(res.data));
    carregar();
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir este evento?")) return;
    await api.delete(`/calendario/${id}`);
    carregar();
  };

  const navegarMes = (delta: number) => {
    let novoMes = mesAtual + delta;
    let novoAno = anoAtual;
    if (novoMes < 0) { novoMes = 11; novoAno--; }
    if (novoMes > 11) { novoMes = 0; novoAno++; }
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
    setDiaSelecionado(null);
  };

  const irParaHoje = () => {
    const hoje = new Date();
    setMesAtual(hoje.getMonth());
    setAnoAtual(hoje.getFullYear());
    setDiaSelecionado(hoje.getDate());
  };

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const mesAnteriorTotalDias = new Date(anoAtual, mesAtual, 0).getDate();

  const getEventosDia = (dia: number) => {
    const data = new Date(anoAtual, mesAtual, dia);
    data.setHours(0, 0, 0, 0);
    return eventos.filter((e) => {
      const inicio = new Date(e.dataInicio);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(e.dataFim);
      fim.setHours(23, 59, 59, 999);
      return data >= inicio && data <= fim;
    });
  };

  const hoje = new Date();
  const isHoje = (dia: number) =>
    dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();

  const eventosDiaSelecionado = diaSelecionado ? getEventosDia(diaSelecionado) : [];

  const totalCelulas = primeiroDia + totalDias;
  const celulasRestantes = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-theme-text-tertiary">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Calendário dos Tribunais" onCreate={() => setShowForm(true)} createLabel="Novo Evento" />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo Evento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">Tribunal</label>
              <input
                type="text"
                value={form.tribunal}
                onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
                placeholder="Ex: TJ-SP, TRF-3, TST"
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2.5 text-sm bg-theme-bg-primary focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2.5 text-sm bg-theme-bg-primary focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
              >
                {tiposEvento.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">Descrição</label>
            <input
              type="text"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Descrição do evento"
              className="w-full border border-theme-border-primary rounded-lg px-3 py-2.5 text-sm bg-theme-bg-primary focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">Data Início</label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2.5 text-sm bg-theme-bg-primary focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">Data Fim</label>
              <input
                type="date"
                value={form.dataFim}
                onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2.5 text-sm bg-theme-bg-primary focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-theme-text-secondary hover:bg-theme-bg-hover transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" className="bg-accent text-white px-6 py-2.5 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium shadow-sm">
              Salvar Evento
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navegarMes(-1)}
            className="p-2 rounded-lg text-theme-text-secondary hover:bg-theme-bg-hover hover:text-theme-text-primary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-theme-text-primary min-w-[180px] text-center">
            {mesesNome[mesAtual]} {anoAtual}
          </h3>
          <button
            onClick={() => navegarMes(1)}
            className="p-2 rounded-lg text-theme-text-secondary hover:bg-theme-bg-hover hover:text-theme-text-primary transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={irParaHoje}
            className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-theme-border-primary text-theme-text-secondary hover:bg-theme-bg-hover hover:text-theme-text-primary transition-colors"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(tipoConfig).map(([tipo, cfg]) => (
              <span key={tipo} className="flex items-center gap-1.5 text-xs text-theme-text-tertiary">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {tipo}
              </span>
            ))}
          </div>
          {tribunais.length > 0 && (
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary pointer-events-none" />
              <select
                value={filtroTribunal}
                onChange={(e) => setFiltroTribunal(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-lg text-sm border border-theme-border-primary bg-theme-bg-primary focus:ring-2 focus:ring-accent-light focus:border-accent transition-shadow appearance-none"
              >
                <option value="">Todos os tribunais</option>
                {tribunais.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 min-w-0">
          <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card overflow-hidden">
            <div className="grid grid-cols-7">
              {diasSemana.map((d) => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-theme-text-tertiary uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 border-t border-theme-border-secondary">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`prev-${i}`} className="min-h-[110px] p-2 border-b border-r border-theme-border-secondary/50 bg-theme-bg-primary/30">
                  <span className="text-xs text-theme-text-tertiary/40">{mesAnteriorTotalDias - primeiroDia + i + 1}</span>
                </div>
              ))}

              {Array.from({ length: totalDias }).map((_, i) => {
                const dia = i + 1;
                const eventosHoje = getEventosDia(dia);
                const selecionado = diaSelecionado === dia;
                return (
                  <div
                    key={dia}
                    onClick={() => setDiaSelecionado(selecionado ? null : dia)}
                    className={`min-h-[110px] p-2 border-b border-r border-theme-border-secondary/50 cursor-pointer transition-colors group
                      ${selecionado ? "bg-accent/5 ring-1 ring-inset ring-accent/30" : "hover:bg-theme-bg-hover/50"}
                      ${isHoje(dia) ? "bg-accent-subtle" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-medium inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors
                          ${isHoje(dia) ? "bg-accent text-white shadow-sm" : "text-theme-text-secondary group-hover:text-theme-text-primary"}
                        `}
                      >
                        {dia}
                      </span>
                      {eventosHoje.length > 0 && (
                        <span className="text-[10px] font-medium text-theme-text-tertiary">
                          {eventosHoje.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {eventosHoje.slice(0, 2).map((e) => {
                        const cfg = tipoConfig[e.tipo] || fallbackConfig;
                        return (
                          <div
                            key={e.id}
                            className={`text-[10px] leading-tight px-1.5 py-1 rounded-md truncate font-medium ${cfg.bg} ${cfg.text}`}
                            title={`${e.tribunal} — ${e.descricao}`}
                          >
                            {e.tribunal}
                          </div>
                        );
                      })}
                      {eventosHoje.length > 2 && (
                        <p className="text-[10px] text-accent font-medium px-1">+{eventosHoje.length - 2}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {Array.from({ length: celulasRestantes }).map((_, i) => (
                <div key={`next-${i}`} className="min-h-[110px] p-2 border-b border-r border-theme-border-secondary/50 bg-theme-bg-primary/30">
                  <span className="text-xs text-theme-text-tertiary/40">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 shrink-0">
          <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card sticky top-4">
            <div className="px-5 py-4 border-b border-theme-border-secondary">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-accent" />
                <h3 className="text-sm font-semibold text-theme-text-primary">
                  {diaSelecionado
                    ? `${diaSelecionado} de ${mesesNome[mesAtual]}`
                    : `Eventos — ${mesesNome[mesAtual]}`
                  }
                </h3>
              </div>
              {diaSelecionado && (
                <button
                  onClick={() => setDiaSelecionado(null)}
                  className="text-xs text-accent hover:text-accent-hover mt-1 transition-colors"
                >
                  Ver todos do mês
                </button>
              )}
            </div>

            <div className="p-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {(diaSelecionado ? eventosDiaSelecionado : eventos).length === 0 ? (
                <div className="py-10 text-center">
                  <CalendarDays size={32} className="mx-auto text-theme-text-tertiary/30 mb-2" />
                  <p className="text-sm text-theme-text-tertiary">Nenhum evento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(diaSelecionado ? eventosDiaSelecionado : eventos).map((e) => {
                    const cfg = tipoConfig[e.tipo] || fallbackConfig;
                    return (
                      <div
                        key={e.id}
                        className={`rounded-lg border p-3 transition-colors ${cfg.border} ${cfg.bg}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                              <span className={`text-xs font-semibold ${cfg.text}`}>{e.tipo}</span>
                            </div>
                            <p className="text-sm font-medium text-theme-text-primary truncate">{e.descricao}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-theme-text-tertiary">
                                <MapPin size={10} />
                                {e.tribunal}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-theme-text-tertiary">
                                <Clock size={10} />
                                {new Date(e.dataInicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                {e.dataInicio !== e.dataFim && ` — ${new Date(e.dataFim).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(ev) => { ev.stopPropagation(); excluir(e.id); }}
                            className="p-1.5 rounded-md text-theme-text-tertiary hover:text-danger hover:bg-danger-light transition-colors shrink-0"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
