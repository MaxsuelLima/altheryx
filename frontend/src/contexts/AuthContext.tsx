import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  nome: string;
  email?: string;
  role: string;
  isAdmin: boolean;
  isMaster?: boolean;
}

interface WorkspaceInfo {
  id: string;
  slug: string;
  nome: string;
  descricao?: string | null;
}

interface AuthState {
  user: User | null;
  workspace: WorkspaceInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isMaster: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, senha: string, workspaceSlug: string) => Promise<void>;
  masterLogin: (senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem("altheryx-token");
    const userStr = localStorage.getItem("altheryx-user");
    const workspaceStr = localStorage.getItem("altheryx-workspace");
    const isMaster = localStorage.getItem("altheryx-is-master") === "true";

    if (token && userStr) {
      try {
        return {
          user: JSON.parse(userStr),
          workspace: workspaceStr ? JSON.parse(workspaceStr) : null,
          token,
          isAuthenticated: true,
          isMaster,
          loading: false,
        };
      } catch {
        localStorage.removeItem("altheryx-token");
        localStorage.removeItem("altheryx-user");
        localStorage.removeItem("altheryx-workspace");
        localStorage.removeItem("altheryx-is-master");
      }
    }

    return {
      user: null,
      workspace: null,
      token: null,
      isAuthenticated: false,
      isMaster: false,
      loading: false,
    };
  });

  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [state.token]);

  const login = useCallback(async (email: string, senha: string, workspaceSlug: string) => {
    const { data } = await api.post("/auth/login", { email, senha, workspaceSlug });

    localStorage.setItem("altheryx-token", data.token);
    localStorage.setItem("altheryx-user", JSON.stringify(data.usuario));
    localStorage.setItem("altheryx-workspace", JSON.stringify(data.workspace));
    localStorage.removeItem("altheryx-is-master");

    setState({
      user: data.usuario,
      workspace: data.workspace,
      token: data.token,
      isAuthenticated: true,
      isMaster: false,
      loading: false,
    });
  }, []);

  const masterLogin = useCallback(async (senha: string) => {
    const { data } = await api.post("/auth/master-login", { senha });

    const masterUser: User = {
      id: "master",
      nome: "Master Admin",
      role: "MASTER_ADMIN",
      isAdmin: true,
      isMaster: true,
    };

    localStorage.setItem("altheryx-token", data.token);
    localStorage.setItem("altheryx-user", JSON.stringify(masterUser));
    localStorage.removeItem("altheryx-workspace");
    localStorage.setItem("altheryx-is-master", "true");

    setState({
      user: masterUser,
      workspace: null,
      token: data.token,
      isAuthenticated: true,
      isMaster: true,
      loading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("altheryx-token");
    localStorage.removeItem("altheryx-user");
    localStorage.removeItem("altheryx-workspace");
    localStorage.removeItem("altheryx-is-master");
    delete api.defaults.headers.common["Authorization"];

    setState({
      user: null,
      workspace: null,
      token: null,
      isAuthenticated: false,
      isMaster: false,
      loading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, masterLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
