import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Publicacao {
  id: string;
  palavraChave: string;
  diarioOrigem: string;
  dataPublicacao: string;
  conteudo: string;
  lida: boolean;
  processo: { id: string; numeroProcesso: string } | null;
}

const diarios = [
  "DJE - Diário da Justiça Eletrônico",
  "DOU - Diário Oficial da União",
  "DOERJ - Diário Oficial do Estado do RJ",
  "DOESP - Diário Oficial do Estado de SP",
  "DOEMG - Diário Oficial do Estado de MG",
  "DJSP - Diário da Justiça de SP",
  "DJRJ - Diário da Justiça do RJ",
];

export default function Publicacoes() {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroLida, setFiltroLida] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [processos, setProcessos] = useState<{ id: string; numeroProcesso: string }[]>([]);

  const [form, setForm] = useState({
    palavraChave: "",
    diarioOrigem: diarios[0],
    dataPublicacao: "",
    conteudo: "",
    processoId: "",
  });

  const carregar = () => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (filtroLida) params.set("lida", filtroLida);

    api
      .get(`/publicacoes?${params}`)
      .then((res) => setPublicacoes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, [busca, filtroLida]);

  useEffect(() => {
    api.get("/processos").then((res) => setProcessos(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/publicacoes", {
      ...form,
      processoId: form.processoId || null,
    });
    setForm({ palavraChave: "", diarioOrigem: diarios[0], dataPublicacao: "", conteudo: "", processoId: "" });
    setShowForm(false);
    carregar();
  };

  const marcarLida = async (id: string) => {
    await api.patch(`/publicacoes/${id}/lida`);
    carregar();
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir esta publicação?")) return;
    await api.delete(`/publicacoes/${id}`);
    carregar();
  };

  const highlight = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-theme-text-tertiary text-lg">Carregando...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text-primary">Publicações</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
        >
          {showForm ? "Cancelar" : "Nova Publicação"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Palavra-chave *</label>
              <input
                type="text"
                value={form.palavraChave}
                onChange={(e) => setForm({ ...form, palavraChave: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Diário de Origem *</label>
              <select
                value={form.diarioOrigem}
                onChange={(e) => setForm({ ...form, diarioOrigem: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                {diarios.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Data da Publicação *</label>
              <input
                type="date"
                value={form.dataPublicacao}
                onChange={(e) => setForm({ ...form, dataPublicacao: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Processo Vinculado</label>
              <select
                value={form.processoId}
                onChange={(e) => setForm({ ...form, processoId: e.target.value })}
                className="w-full border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
              >
                <option value="">Nenhum</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>{p.numeroProcesso}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">Conteúdo *</label>
              <textarea
                value={form.conteudo}
                onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                rows={4}
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

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por palavra-chave, conteúdo ou diário..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 border border-theme-border-primary rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        />
        <select
          value={filtroLida}
          onChange={(e) => setFiltroLida(e.target.value)}
          className="border border-theme-border-primary rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-light focus:border-accent"
        >
          <option value="">Todas</option>
          <option value="false">Não lidas</option>
          <option value="true">Lidas</option>
        </select>
      </div>

      {publicacoes.length === 0 ? (
        <div className="bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-12 text-center">
          <p className="text-theme-text-tertiary text-lg">Nenhuma publicação encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publicacoes.map((pub) => (
            <div
              key={pub.id}
              className={`bg-theme-card-bg rounded-xl border border-theme-card-border shadow-card p-5 border-l-4 ${
                pub.lida ? "border-theme-border-secondary" : "border-accent"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-accent-light text-accent px-2 py-0.5 rounded text-xs font-medium">
                      {pub.palavraChave}
                    </span>
                    <span className="bg-theme-bg-tertiary text-theme-text-secondary px-2 py-0.5 rounded text-xs">
                      {pub.diarioOrigem}
                    </span>
                    <span className="text-xs text-theme-text-tertiary">
                      {new Date(pub.dataPublicacao).toLocaleDateString("pt-BR")}
                    </span>
                    {!pub.lida && (
                      <span className="bg-info-light0 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        Nova
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-theme-text-secondary leading-relaxed">
                    {highlight(pub.conteudo, busca || pub.palavraChave)}
                  </p>
                  {pub.processo && (
                    <p className="text-xs text-accent mt-2">
                      Processo: {pub.processo.numeroProcesso}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {!pub.lida && (
                    <button
                      onClick={() => marcarLida(pub.id)}
                      className="text-xs bg-success-light text-success px-3 py-1.5 rounded-lg hover:bg-success-light transition-colors"
                    >
                      Marcar Lida
                    </button>
                  )}
                  <button
                    onClick={() => excluir(pub.id)}
                    className="text-xs bg-danger-light text-danger px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
