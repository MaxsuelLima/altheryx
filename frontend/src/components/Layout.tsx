import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/processos", label: "Processos", icon: "📁" },
  { path: "/clientes", label: "Clientes", icon: "👥" },
  { path: "/escritorios", label: "Escritórios", icon: "🏢" },
  { path: "/advogados", label: "Advogados", icon: "⚖️" },
  { path: "/juizes", label: "Juízes", icon: "🧑‍⚖️" },
  { path: "/testemunhas", label: "Testemunhas", icon: "🗣️" },
  { path: "/peritos", label: "Peritos", icon: "🔬" },
  { path: "/prepostos", label: "Prepostos", icon: "🧑‍💼" },
  { path: "/publicacoes", label: "Publicações", icon: "📰" },
  { path: "/prazos", label: "Prazos", icon: "⏰" },
  { path: "/calendario", label: "Calendário", icon: "📅" },
  { path: "/procuracoes", label: "Procurações", icon: "📜" },
  { path: "/requisicoes", label: "Requisições", icon: "📋" },
  { path: "/relatorios", label: "Relatórios", icon: "📄" },
  { path: "/aprovacoes", label: "Aprovações", icon: "✅" },
  { path: "/insights", label: "Insights", icon: "💡" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-primary-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-primary-700">
          {sidebarOpen && (
            <h1 className="text-xl font-bold tracking-wide">Altheryx</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-primary-300 hover:text-white p-1"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const active = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  active
                    ? "bg-primary-700 text-white border-r-4 border-white"
                    : "text-primary-200 hover:bg-primary-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
