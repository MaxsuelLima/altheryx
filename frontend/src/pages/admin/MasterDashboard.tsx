import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import {
  Building2,
  Plus,
  Users,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

interface Workspace {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  _count: { usuarios: number };
}

interface WorkspaceDetail extends Workspace {
  usuarios: {
    id: string;
    nome: string;
    email: string;
    role: string;
    isAdmin: boolean;
    ativo: boolean;
    criadoEm: string;
  }[];
  _count: { usuarios: number; processos: number; clientes: number };
}

export default function MasterDashboard() {
  const { logout, isMaster } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<WorkspaceDetail | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormUser, setMostrarFormUser] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [novoWorkspace, setNovoWorkspace] = useState({
    slug: "",
    nome: "",
    descricao: "",
    admin: { nome: "", email: "", senha: "" },
  });

  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "ESTAGIARIO",
    isAdmin: false,
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    if (!isMaster) {
      navigate("/admin/login");
      return;
    }
    carregarWorkspaces();
  }, [isMaster, navigate]);

  async function carregarWorkspaces() {
    try {
      const { data } = await api.get("/admin/workspaces");
      setWorkspaces(data);
    } catch {
      setErro("Erro ao carregar workspaces");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(id: string) {
    try {
      const { data } = await api.get(`/admin/workspaces/${id}`);
      setDetalhe(data);
    } catch {
      setErro("Erro ao carregar detalhes");
    }
  }

  async function handleToggle(id: string) {
    if (expandido === id) {
      setExpandido(null);
      setDetalhe(null);
    } else {
      setExpandido(id);
      await carregarDetalhe(id);
    }
  }

  async function criarWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    try {
      await api.post("/admin/workspaces", novoWorkspace);
      setMostrarForm(false);
      setNovoWorkspace({ slug: "", nome: "", descricao: "", admin: { nome: "", email: "", senha: "" } });
      await carregarWorkspaces();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErro(typeof msg === "string" ? msg : "Erro ao criar workspace");
    }
  }

  async function adicionarUsuario(e: React.FormEvent, workspaceId: string) {
    e.preventDefault();
    setErro("");

    try {
      await api.post(`/admin/workspaces/${workspaceId}/usuarios`, novoUsuario);
      setMostrarFormUser(null);
      setNovoUsuario({ nome: "", email: "", senha: "", role: "ESTAGIARIO", isAdmin: false });
      await carregarDetalhe(workspaceId);
      await carregarWorkspaces();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErro(typeof msg === "string" ? msg : "Erro ao criar usuário");
    }
  }

  async function toggleAtivoWorkspace(id: string, ativo: boolean) {
    try {
      await api.put(`/admin/workspaces/${id}`, { ativo: !ativo });
      await carregarWorkspaces();
      if (expandido === id) await carregarDetalhe(id);
    } catch {
      setErro("Erro ao atualizar workspace");
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <div className="text-theme-text-secondary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      <header className="h-14 border-b border-theme-sidebar-border bg-theme-sidebar-bg flex items-center justify-between px-6">
        <span className="text-lg font-bold text-accent">Altheryx — Master Admin</span>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 text-sm text-theme-text-secondary hover:text-red-500 transition"
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-theme-text-primary">Workspaces</h1>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition text-sm"
          >
            <Plus size={16} />
            Novo Workspace
          </button>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg px-4 py-3 text-sm mb-4">
            {erro}
            <button onClick={() => setErro("")} className="ml-2 underline">fechar</button>
          </div>
        )}

        {mostrarForm && (
          <form onSubmit={criarWorkspace} className="bg-theme-bg-secondary rounded-xl p-6 mb-6 border border-theme-sidebar-border space-y-4">
            <h2 className="text-lg font-semibold text-theme-text-primary">Novo Workspace</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-theme-text-secondary mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={novoWorkspace.slug}
                  onChange={(e) => setNovoWorkspace({ ...novoWorkspace, slug: e.target.value.replace(/[^a-z0-9-]/g, "") })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="meu-escritorio"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-theme-text-secondary mb-1">Nome</label>
                <input
                  type="text"
                  value={novoWorkspace.nome}
                  onChange={(e) => setNovoWorkspace({ ...novoWorkspace, nome: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Meu Escritório"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text-secondary mb-1">Descrição</label>
              <input
                type="text"
                value={novoWorkspace.descricao}
                onChange={(e) => setNovoWorkspace({ ...novoWorkspace, descricao: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="Descrição opcional"
              />
            </div>
            <div className="border-t border-theme-sidebar-border pt-4">
              <h3 className="text-sm font-semibold text-theme-text-primary mb-3">Usuário Admin do Workspace</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-theme-text-secondary mb-1">Nome</label>
                  <input
                    type="text"
                    value={novoWorkspace.admin.nome}
                    onChange={(e) => setNovoWorkspace({ ...novoWorkspace, admin: { ...novoWorkspace.admin, nome: e.target.value } })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-theme-text-secondary mb-1">Email</label>
                  <input
                    type="email"
                    value={novoWorkspace.admin.email}
                    onChange={(e) => setNovoWorkspace({ ...novoWorkspace, admin: { ...novoWorkspace.admin, email: e.target.value } })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-theme-text-secondary mb-1">Senha</label>
                  <input
                    type="password"
                    value={novoWorkspace.admin.senha}
                    onChange={(e) => setNovoWorkspace({ ...novoWorkspace, admin: { ...novoWorkspace.admin, senha: e.target.value } })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 rounded-lg text-sm text-theme-text-secondary hover:text-theme-text-primary transition">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition">
                Criar Workspace
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {workspaces.map((ws) => (
            <div key={ws.id} className="bg-theme-bg-secondary rounded-xl border border-theme-sidebar-border overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[var(--sidebar-hover)] transition"
                onClick={() => handleToggle(ws.id)}
              >
                <div className="flex items-center gap-4">
                  <Building2 size={20} className="text-accent" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-theme-text-primary">{ws.nome}</span>
                      <span className="text-xs text-theme-text-tertiary bg-theme-bg-primary px-2 py-0.5 rounded">/{ws.slug}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${ws.ativo ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {ws.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    {ws.descricao && <p className="text-xs text-theme-text-tertiary mt-0.5">{ws.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-sm text-theme-text-secondary">
                    <Users size={14} />
                    {ws._count.usuarios}
                  </span>
                  {expandido === ws.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expandido === ws.id && detalhe && (
                <div className="border-t border-theme-sidebar-border px-5 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 text-sm text-theme-text-secondary">
                      <span>Processos: {detalhe._count.processos}</span>
                      <span>Clientes: {detalhe._count.clientes}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAtivoWorkspace(ws.id, ws.ativo)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition ${ws.ativo ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"}`}
                      >
                        {ws.ativo ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => setMostrarFormUser(mostrarFormUser === ws.id ? null : ws.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition"
                      >
                        <UserPlus size={14} />
                        Novo Usuário
                      </button>
                    </div>
                  </div>

                  {mostrarFormUser === ws.id && (
                    <form onSubmit={(e) => adicionarUsuario(e, ws.id)} className="bg-theme-bg-primary rounded-lg p-4 mb-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={novoUsuario.nome}
                          onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                          required
                          placeholder="Nome"
                          className="px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-secondary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                        <input
                          type="email"
                          value={novoUsuario.email}
                          onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                          required
                          placeholder="Email"
                          className="px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-secondary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                        <div className="relative">
                          <input
                            type={mostrarSenha ? "text" : "password"}
                            value={novoUsuario.senha}
                            onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                            required
                            minLength={6}
                            placeholder="Senha"
                            className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-secondary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 pr-8"
                          />
                          <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-text-tertiary">
                            {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <select
                          value={novoUsuario.role}
                          onChange={(e) => setNovoUsuario({ ...novoUsuario, role: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-secondary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="ADVOGADO">Advogado</option>
                          <option value="ESTAGIARIO">Estagiário</option>
                          <option value="SECRETARIA">Secretária</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                          <input
                            type="checkbox"
                            checked={novoUsuario.isAdmin}
                            onChange={(e) => setNovoUsuario({ ...novoUsuario, isAdmin: e.target.checked })}
                            className="rounded"
                          />
                          Admin do Workspace
                        </label>
                        <div className="flex-1" />
                        <button type="button" onClick={() => setMostrarFormUser(null)} className="px-3 py-1.5 text-sm text-theme-text-secondary hover:text-theme-text-primary transition">
                          Cancelar
                        </button>
                        <button type="submit" className="px-3 py-1.5 rounded bg-accent text-white text-sm font-medium hover:opacity-90 transition">
                          Criar
                        </button>
                      </div>
                    </form>
                  )}

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-theme-text-tertiary text-xs border-b border-theme-sidebar-border">
                        <th className="text-left py-2 font-medium">Nome</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">Cargo</th>
                        <th className="text-left py-2 font-medium">Admin</th>
                        <th className="text-left py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhe.usuarios.map((u) => (
                        <tr key={u.id} className="border-b border-theme-sidebar-border/50">
                          <td className="py-2 text-theme-text-primary">{u.nome}</td>
                          <td className="py-2 text-theme-text-secondary">{u.email}</td>
                          <td className="py-2 text-theme-text-secondary">{u.role}</td>
                          <td className="py-2">
                            {u.isAdmin && <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">Admin</span>}
                          </td>
                          <td className="py-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${u.ativo ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                              {u.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="text-center py-12 text-theme-text-secondary">
              Nenhum workspace criado ainda. Clique em "Novo Workspace" para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
