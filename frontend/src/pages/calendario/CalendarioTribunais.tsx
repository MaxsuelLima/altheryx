import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Evento {
  id: string;
  tribunal: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  tipo: string;
}

const tipoEventoColors: Record<string, string> = {
  Recesso: "bg-info-light text-info border-blue-300",
  Feriado: "bg-danger-light text-danger border-red-300",
  "Suspensão de Prazos": "bg-warning-light text-warning border-amber-300",
  Plantão: "bg-success-light text-success border-green-300",
  Mutirão: "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] border-purple-300",
};

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
  };

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();

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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary">Calendário dos Tribunais</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
        >
          {showForm ? "Cancelar" : "Novo Evento"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Tribunal *</label>
              <input
                type="text"
                value={form.tribunal}
                onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
                placeholder="Ex: TJ-SP, TRF-3, TST"
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                {tiposEvento.map((t) => (
                  <option key={t} value={t}>{t}</option>
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
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium">
              Salvar
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={() => navegarMes(-1)}
          className="bg-theme-bg-tertiary text-theme-text-secondary px-3 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm"
        >
          &lt; Anterior
        </button>
        <h3 className="text-lg font-semibold text-theme-text-primary min-w-[200px] text-center">
          {mesesNome[mesAtual]} {anoAtual}
        </h3>
        <button
          onClick={() => navegarMes(1)}
          className="bg-theme-bg-tertiary text-theme-text-secondary px-3 py-2 rounded-lg hover:bg-theme-bg-hover transition-colors text-sm"
        >
          Próximo &gt;
        </button>
        {tribunais.length > 0 && (
          <select
            value={filtroTribunal}
            onChange={(e) => setFiltroTribunal(e.target.value)}
            className="ml-auto border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
          >
            <option value="">Todos os tribunais</option>
            {tribunais.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-theme-card-bg rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7">
          {diasSemana.map((d) => (
            <div key={d} className="bg-theme-bg-tertiary text-center py-2 text-xs font-semibold text-theme-text-secondary border-b">
              {d}
            </div>
          ))}
          {Array.from({ length: primeiroDia }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-theme-bg-tertiary min-h-[100px] border-b border-r" />
          ))}
          {Array.from({ length: totalDias }).map((_, i) => {
            const dia = i + 1;
            const eventosHoje = getEventosDia(dia);
            return (
              <div
                key={dia}
                className={`min-h-[100px] border-b border-r p-1 ${
                  isHoje(dia) ? "bg-accent-subtle" : ""
                }`}
              >
                <span
                  className={`text-xs font-medium inline-block w-6 h-6 text-center leading-6 rounded-full ${
                    isHoje(dia) ? "bg-accent text-white" : "text-theme-text-secondary"
                  }`}
                >
                  {dia}
                </span>
                <div className="mt-1 space-y-0.5">
                  {eventosHoje.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={`text-[10px] px-1 py-0.5 rounded truncate border cursor-default ${
                        tipoEventoColors[e.tipo] || "bg-theme-bg-tertiary text-theme-text-secondary border-theme-border-primary"
                      }`}
                      title={`${e.tribunal} - ${e.descricao}`}
                    >
                      {e.tribunal}
                    </div>
                  ))}
                  {eventosHoje.length > 3 && (
                    <p className="text-[10px] text-theme-text-tertiary px-1">+{eventosHoje.length - 3} mais</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {eventos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-theme-text-primary mb-3">Eventos do Mês</h3>
          <div className="space-y-2">
            {eventos.map((e) => (
              <div
                key={e.id}
                className={`bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-4 flex items-center justify-between border-l-4 ${
                  tipoEventoColors[e.tipo]?.includes("border")
                    ? tipoEventoColors[e.tipo]?.split(" ").find((c) => c.startsWith("border-")) || "border-theme-border-primary"
                    : "border-theme-border-primary"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tipoEventoColors[e.tipo]?.split(" border")[0] || "bg-theme-bg-tertiary text-theme-text-secondary"
                    }`}>
                      {e.tipo}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-theme-text-primary">{e.descricao}</p>
                    <p className="text-xs text-theme-text-tertiary">
                      {e.tribunal} | {new Date(e.dataInicio).toLocaleDateString("pt-BR")}
                      {" — "}
                      {new Date(e.dataFim).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => excluir(e.id)}
                  className="text-xs bg-danger-light text-danger px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(tipoEventoColors).map(([tipo, classes]) => (
          <div key={tipo} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${classes.split(" ")[0]}`} />
            <span className="text-xs text-theme-text-secondary">{tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
