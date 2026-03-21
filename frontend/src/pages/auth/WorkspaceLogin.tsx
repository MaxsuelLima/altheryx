import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { LogIn, Eye, EyeOff } from "lucide-react";

interface WorkspaceInfo {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export default function WorkspaceLogin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { login, isAuthenticated, workspace } = useAuth();

  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    if (isAuthenticated && workspace?.slug === slug) {
      navigate(`/workspace/${slug}`);
    }
  }, [isAuthenticated, workspace, slug, navigate]);

  useEffect(() => {
    async function carregarWorkspace() {
      try {
        const { data } = await api.get(`/auth/workspace/${slug}`);
        setWorkspaceInfo(data);
      } catch {
        setErro("Workspace não encontrado");
      } finally {
        setLoadingWorkspace(false);
      }
    }
    if (slug) carregarWorkspace();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha, slug!);
      navigate(`/workspace/${slug}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErro(msg || "Erro ao realizar login");
    } finally {
      setCarregando(false);
    }
  }

  if (loadingWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <div className="text-theme-text-secondary">Carregando...</div>
      </div>
    );
  }

  if (!workspaceInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <div className="bg-theme-bg-secondary rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Workspace não encontrado</h1>
          <p className="text-theme-text-secondary mb-6">
            O workspace "{slug}" não existe ou está inativo.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary p-4">
      <div className="bg-theme-bg-secondary rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent mb-2">Altheryx</h1>
          <h2 className="text-lg font-semibold text-theme-text-primary">{workspaceInfo.nome}</h2>
          {workspaceInfo.descricao && (
            <p className="text-sm text-theme-text-secondary mt-1">{workspaceInfo.descricao}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg px-4 py-3 text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 pr-10"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary hover:text-theme-text-primary"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <LogIn size={18} />
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
