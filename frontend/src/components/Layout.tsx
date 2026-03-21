import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Scale,
  Gavel,
  MessageSquare,
  Microscope,
  UserCheck,
  Newspaper,
  Clock,
  CalendarDays,
  ScrollText,
  ClipboardList,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  UserCog,
  Settings,
} from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

function getMenuStructure(): (MenuItem | MenuGroup)[] {
  return [
    { path: "", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    {
      label: "Gestão Processual",
      items: [
        { path: "processos", label: "Processos", icon: <FileText size={18} /> },
        { path: "publicacoes", label: "Publicações", icon: <Newspaper size={18} /> },
        { path: "prazos", label: "Prazos", icon: <Clock size={18} /> },
        { path: "calendario", label: "Calendário", icon: <CalendarDays size={18} /> },
      ],
    },
    {
      label: "Pessoas",
      items: [
        { path: "clientes", label: "Clientes", icon: <Users size={18} /> },
        { path: "advogados", label: "Advogados", icon: <Scale size={18} /> },
        { path: "juizes", label: "Juízes", icon: <Gavel size={18} /> },
        { path: "testemunhas", label: "Testemunhas", icon: <MessageSquare size={18} /> },
        { path: "peritos", label: "Peritos", icon: <Microscope size={18} /> },
        { path: "prepostos", label: "Prepostos", icon: <UserCheck size={18} /> },
      ],
    },
    {
      label: "Estrutura",
      items: [
        { path: "escritorios", label: "Escritórios", icon: <Building2 size={18} /> },
      ],
    },
    {
      label: "Documentos",
      items: [
        { path: "procuracoes", label: "Procurações", icon: <ScrollText size={18} /> },
        { path: "requisicoes", label: "Requisições", icon: <ClipboardList size={18} /> },
      ],
    },
    {
      label: "Análises",
      items: [
        { path: "relatorios", label: "Relatórios", icon: <BarChart3 size={18} /> },
        { path: "aprovacoes", label: "Aprovações", icon: <CheckCircle2 size={18} /> },
        { path: "insights", label: "Insights", icon: <Lightbulb size={18} /> },
      ],
    },
    {
      label: "Administração",
      items: [
        { path: "usuarios", label: "Usuários", icon: <UserCog size={18} />, adminOnly: true },
      ],
    },
  ];
}

function isGroup(item: MenuItem | MenuGroup): item is MenuGroup {
  return "items" in item;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { theme, toggleTheme } = useTheme();
  const { user, workspace, logout } = useAuth();

  const basePath = `/workspace/${slug}`;

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("sidebar-groups");
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<string, boolean> = {};
    getMenuStructure().forEach((item) => {
      if (isGroup(item)) initial[item.label] = true;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try { localStorage.setItem("sidebar-groups", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  function isActiveRoute(pathname: string, itemPath: string) {
    const fullPath = itemPath === "" ? basePath : `${basePath}/${itemPath}`;
    if (itemPath === "") return pathname === basePath || pathname === basePath + "/";
    return pathname === fullPath || pathname.startsWith(fullPath + "/");
  }

  function isGroupActive(pathname: string, group: MenuGroup) {
    return group.items.some((item) => isActiveRoute(pathname, item.path));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  const menuStructure = getMenuStructure();

  const renderMenuItem = (item: MenuItem) => {
    if (item.adminOnly && !user?.isAdmin) return null;

    const fullPath = item.path === "" ? basePath : `${basePath}/${item.path}`;
    const active = isActiveRoute(location.pathname, item.path);

    return (
      <Link
        key={item.path}
        to={fullPath}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group relative
          ${active
            ? "bg-[var(--sidebar-active)] text-accent font-medium"
            : "text-theme-text-secondary hover:bg-[var(--sidebar-hover)] hover:text-theme-text-primary"
          }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-r-full" />
        )}
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-theme-bg-primary">
      <aside
        className={`${collapsed ? "w-[68px]" : "w-60"} shrink-0 h-screen bg-theme-sidebar-bg border-r border-theme-sidebar-border flex flex-col transition-all duration-300`}
      >
        <div className={`h-14 flex items-center border-b border-theme-sidebar-border ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-lg font-bold text-accent tracking-tight block">Altheryx</span>
              {workspace && (
                <span className="text-[10px] text-theme-text-tertiary truncate block">{workspace.nome}</span>
              )}
            </div>
          )}
          <button
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {menuStructure.map((item, idx) => {
            if (!isGroup(item)) return renderMenuItem(item);

            const group = item;
            const visibleItems = group.items.filter((i) => !i.adminOnly || user?.isAdmin);
            if (visibleItems.length === 0) return null;

            const groupOpen = openGroups[group.label] ?? true;
            const active = isGroupActive(location.pathname, group);

            return (
              <div key={group.label} className={idx > 0 ? "pt-2" : ""}>
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
                  >
                    <span className={active ? "text-accent" : ""}>{group.label}</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${groupOpen ? "" : "-rotate-90"}`}
                    />
                  </button>
                ) : (
                  <div className="h-px bg-theme-sidebar-border mx-2 my-2" />
                )}

                {(collapsed || groupOpen) && (
                  <div className="space-y-0.5 mt-0.5">
                    {visibleItems.map(renderMenuItem)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-theme-sidebar-border p-2" ref={settingsRef}>
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              title={collapsed ? user?.nome || "Configurações" : undefined}
              className={`flex items-center gap-2 rounded-lg text-sm transition-all w-full hover:bg-[var(--sidebar-hover)]
                ${collapsed ? "p-2 justify-center" : "px-3 py-2"}`}
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold uppercase">
                {user?.nome?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "?"}
              </span>
              {!collapsed && user && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="font-medium text-theme-text-secondary truncate text-xs">{user.nome}</div>
                    <div className="text-theme-text-tertiary truncate text-[10px]">{user.email}</div>
                  </div>
                  <Settings size={16} className="shrink-0 text-theme-text-tertiary" />
                </>
              )}
            </button>

            {settingsOpen && (
              <div className={`absolute bottom-full mb-1 ${collapsed ? "left-full ml-1" : "left-0 right-0"} bg-theme-card-bg border border-theme-border rounded-lg shadow-lg py-1 z-50`}>
                <button
                  onClick={() => { toggleTheme(); setSettingsOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-theme-text-secondary hover:bg-[var(--sidebar-hover)] hover:text-theme-text-primary transition-colors"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
                </button>
                <button
                  onClick={() => { setSettingsOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-theme-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
