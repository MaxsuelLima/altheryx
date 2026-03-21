import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function MasterLogin() {
  const navigate = useNavigate();
  const { masterLogin, isMaster } = useAuth();

  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (isMaster) {
    navigate("/admin/workspaces");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await masterLogin(senha);
      navigate("/admin/workspaces");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErro(msg || "Senha inválida");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary p-4">
      <div className="bg-theme-bg-secondary rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Master Admin</h1>
          <p className="text-sm text-theme-text-secondary mt-1">Painel de administração de workspaces</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg px-4 py-3 text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1">Senha Master</label>
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
            <Shield size={18} />
            {carregando ? "Verificando..." : "Acessar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-theme-text-tertiary hover:text-accent transition flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={14} />
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
}
