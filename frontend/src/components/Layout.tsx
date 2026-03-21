import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
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
} from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuStructure: (MenuItem | MenuGroup)[] = [
  { path: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  {
    label: "Gestão Processual",
    items: [
      { path: "/processos", label: "Processos", icon: <FileText size={18} /> },
      { path: "/publicacoes", label: "Publicações", icon: <Newspaper size={18} /> },
      { path: "/prazos", label: "Prazos", icon: <Clock size={18} /> },
      { path: "/calendario", label: "Calendário", icon: <CalendarDays size={18} /> },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { path: "/clientes", label: "Clientes", icon: <Users size={18} /> },
      { path: "/advogados", label: "Advogados", icon: <Scale size={18} /> },
      { path: "/juizes", label: "Juízes", icon: <Gavel size={18} /> },
      { path: "/testemunhas", label: "Testemunhas", icon: <MessageSquare size={18} /> },
      { path: "/peritos", label: "Peritos", icon: <Microscope size={18} /> },
      { path: "/prepostos", label: "Prepostos", icon: <UserCheck size={18} /> },
    ],
  },
  {
    label: "Estrutura",
    items: [
      { path: "/escritorios", label: "Escritórios", icon: <Building2 size={18} /> },
    ],
  },
  {
    label: "Documentos",
    items: [
      { path: "/procuracoes", label: "Procurações", icon: <ScrollText size={18} /> },
      { path: "/requisicoes", label: "Requisições", icon: <ClipboardList size={18} /> },
    ],
  },
  {
    label: "Análises",
    items: [
      { path: "/relatorios", label: "Relatórios", icon: <BarChart3 size={18} /> },
      { path: "/aprovacoes", label: "Aprovações", icon: <CheckCircle2 size={18} /> },
      { path: "/insights", label: "Insights", icon: <Lightbulb size={18} /> },
    ],
  },
];

function isGroup(item: MenuItem | MenuGroup): item is MenuGroup {
  return "items" in item;
}

function isActiveRoute(pathname: string, itemPath: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
}

function isGroupActive(pathname: string, group: MenuGroup) {
  return group.items.some((item) => isActiveRoute(pathname, item.path));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuStructure.forEach((item) => {
      if (isGroup(item)) initial[item.label] = true;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActiveRoute(location.pathname, item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
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
    <div className="min-h-screen flex bg-theme-bg-primary">
      <aside
        className={`${collapsed ? "w-[68px]" : "w-60"} shrink-0 bg-theme-sidebar-bg border-r border-theme-sidebar-border flex flex-col transition-all duration-300`}
      >
        <div className={`h-14 flex items-center border-b border-theme-sidebar-border ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          {!collapsed && (
            <span className="text-lg font-bold text-accent tracking-tight">Altheryx</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-theme-text-tertiary hover:text-theme-text-primary transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {menuStructure.map((item, idx) => {
            if (!isGroup(item)) return renderMenuItem(item);

            const group = item;
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
                    {group.items.map(renderMenuItem)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`border-t border-theme-sidebar-border p-2 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className={`flex items-center gap-2 rounded-lg text-sm transition-all text-theme-text-secondary hover:text-theme-text-primary hover:bg-[var(--sidebar-hover)]
              ${collapsed ? "p-2" : "w-full px-3 py-2"}`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && (
              <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
