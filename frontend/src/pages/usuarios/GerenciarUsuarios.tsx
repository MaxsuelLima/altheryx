import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Trash2, Pencil, Eye, EyeOff, X, Check } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  isAdmin: boolean;
  ativo: boolean;
  criadoEm: string;
}

export default function GerenciarUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "ESTAGIARIO",
    isAdmin: false,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch {
      setErro("Erro ao carregar usuários");
    }
  }

  function resetForm() {
    setForm({ nome: "", email: "", senha: "", role: "ESTAGIARIO", isAdmin: false });
    setEditandoId(null);
    setMostrarForm(false);
    setErro("");
  }

  function editarUsuario(u: Usuario) {
    setForm({ nome: u.nome, email: u.email, senha: "", role: u.role, isAdmin: u.isAdmin });
    setEditandoId(u.id);
    setMostrarForm(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    try {
      if (editandoId) {
        const dados: Record<string, unknown> = { nome: form.nome, email: form.email, role: form.role, isAdmin: form.isAdmin };
        if (form.senha) dados.senha = form.senha;
        await api.put(`/usuarios/${editandoId}`, dados);
      } else {
        await api.post("/usuarios", form);
      }
      resetForm();
      await carregar();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErro(typeof msg === "string" ? msg : "Erro ao salvar usuário");
    }
  }

  async function excluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      await carregar();
    } catch {
      setErro("Erro ao excluir usuário");
    }
  }

  async function toggleAtivo(u: Usuario) {
    try {
      await api.put(`/usuarios/${u.id}`, { ativo: !u.ativo });
      await carregar();
    } catch {
      setErro("Erro ao atualizar status");
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    ADVOGADO: "Advogado",
    ESTAGIARIO: "Estagiário",
    SECRETARIA: "Secretária",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-theme-text-primary">Gerenciar Usuários</h1>
        {(user?.isAdmin || user?.isMaster) && (
          <button
            onClick={() => { resetForm(); setMostrarForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition text-sm"
          >
            <Plus size={16} />
            Novo Usuário
          </button>
        )}
      </div>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg px-4 py-3 text-sm mb-4">
          {erro}
          <button onClick={() => setErro("")} className="ml-2 underline">fechar</button>
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-theme-bg-secondary rounded-xl p-6 mb-6 border border-theme-sidebar-border space-y-4">
          <h2 className="text-lg font-semibold text-theme-text-primary">
            {editandoId ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-theme-text-secondary mb-1">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text-secondary mb-1">
                Senha {editandoId && "(deixe vazio para manter)"}
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  required={!editandoId}
                  minLength={6}
                  className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 pr-8"
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-text-tertiary">
                  {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text-secondary mb-1">Cargo</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="ADMIN">Admin</option>
                <option value="ADVOGADO">Advogado</option>
                <option value="ESTAGIARIO">Estagiário</option>
                <option value="SECRETARIA">Secretária</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
            <input
              type="checkbox"
              checked={form.isAdmin}
              onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
              className="rounded"
            />
            Administrador do Workspace (pode gerenciar usuários)
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-theme-text-secondary hover:text-theme-text-primary transition">
              <X size={14} />
              Cancelar
            </button>
            <button type="submit" className="flex items-center gap-1 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition">
              <Check size={14} />
              {editandoId ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-theme-bg-secondary rounded-xl border border-theme-sidebar-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-theme-text-tertiary text-xs border-b border-theme-sidebar-border bg-theme-bg-primary/50">
              <th className="text-left px-5 py-3 font-medium">Nome</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Cargo</th>
              <th className="text-left px-5 py-3 font-medium">Tipo</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-theme-sidebar-border/50 hover:bg-[var(--sidebar-hover)] transition">
                <td className="px-5 py-3 text-theme-text-primary font-medium">{u.nome}</td>
                <td className="px-5 py-3 text-theme-text-secondary">{u.email}</td>
                <td className="px-5 py-3 text-theme-text-secondary">{roleLabels[u.role] || u.role}</td>
                <td className="px-5 py-3">
                  {u.isAdmin && <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">Admin</span>}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleAtivo(u)}
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer transition ${u.ativo ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"}`}
                  >
                    {u.ativo ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => editarUsuario(u)}
                      className="p-1.5 rounded hover:bg-[var(--sidebar-hover)] text-theme-text-tertiary hover:text-accent transition"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => excluir(u.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-theme-text-tertiary hover:text-red-500 transition"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="text-center py-12 text-theme-text-secondary">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
