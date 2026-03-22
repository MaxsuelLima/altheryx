import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, ArrowRight, Shield } from "lucide-react";

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { isAuthenticated, workspace } = useAuth();
  const [slug, setSlug] = useState("");

  if (isAuthenticated && workspace) {
    return <Navigate to={`/workspace/${workspace.slug}`} replace />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (slug.trim()) {
      navigate(`/workspace/${slug.trim().toLowerCase()}/login`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary p-4">
      <div className="bg-theme-bg-secondary rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">Altheryx</h1>
          <p className="text-theme-text-secondary">Sistema de Gestão Jurídica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-1">
              Workspace
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-theme-sidebar-border bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="nome-do-workspace"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-theme-sidebar-border text-center">
          <button
            onClick={() => navigate("/admin/login")}
            className="text-sm text-theme-text-tertiary hover:text-accent transition flex items-center gap-1.5 mx-auto"
          >
            <Shield size={14} />
            Acesso Master Admin
          </button>
        </div>
      </div>
    </div>
  );
}
