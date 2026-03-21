import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ListaClientes from "./pages/clientes/ListaClientes";
import ListaEscritorios from "./pages/escritorios/ListaEscritorios";
import ListaAdvogados from "./pages/advogados/ListaAdvogados";
import ListaJuizes from "./pages/juizes/ListaJuizes";
import ListaTestemunhas from "./pages/testemunhas/ListaTestemunhas";
import ListaProcessos from "./pages/processos/ListaProcessos";
import DetalheProcesso from "./pages/processos/DetalheProcesso";
import Insights from "./pages/Insights";
import Publicacoes from "./pages/publicacoes/Publicacoes";
import GestaoPrazos from "./pages/prazos/GestaoPrazos";
import CalendarioTribunais from "./pages/calendario/CalendarioTribunais";
import ListaProcuracoes from "./pages/procuracoes/ListaProcuracoes";
import ListaRequisicoes from "./pages/requisicoes/ListaRequisicoes";
import ListaPeritos from "./pages/peritos/ListaPeritos";
import ListaPrepostos from "./pages/prepostos/ListaPrepostos";
import Relatorios from "./pages/relatorios/Relatorios";
import Aprovacoes from "./pages/aprovacoes/Aprovacoes";
import SelectWorkspace from "./pages/auth/SelectWorkspace";
import WorkspaceLogin from "./pages/auth/WorkspaceLogin";
import MasterLogin from "./pages/admin/MasterLogin";
import MasterDashboard from "./pages/admin/MasterDashboard";
import GerenciarUsuarios from "./pages/usuarios/GerenciarUsuarios";

function WorkspaceGuard() {
  const { isAuthenticated, isMaster, workspace } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isMaster) {
    return <Navigate to="/admin/workspaces" replace />;
  }

  if (!workspace) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function MasterGuard() {
  const { isAuthenticated, isMaster } = useAuth();

  if (!isAuthenticated || !isMaster) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SelectWorkspace />} />
      <Route path="/workspace/:slug/login" element={<WorkspaceLogin />} />

      <Route path="/admin/login" element={<MasterLogin />} />
      <Route element={<MasterGuard />}>
        <Route path="/admin/workspaces" element={<MasterDashboard />} />
      </Route>

      <Route path="/workspace/:slug" element={<WorkspaceGuard />}>
        <Route index element={<Home />} />
        <Route path="processos" element={<ListaProcessos />} />
        <Route path="processos/:id" element={<DetalheProcesso />} />
        <Route path="clientes" element={<ListaClientes />} />
        <Route path="escritorios" element={<ListaEscritorios />} />
        <Route path="advogados" element={<ListaAdvogados />} />
        <Route path="juizes" element={<ListaJuizes />} />
        <Route path="testemunhas" element={<ListaTestemunhas />} />
        <Route path="peritos" element={<ListaPeritos />} />
        <Route path="prepostos" element={<ListaPrepostos />} />
        <Route path="publicacoes" element={<Publicacoes />} />
        <Route path="prazos" element={<GestaoPrazos />} />
        <Route path="calendario" element={<CalendarioTribunais />} />
        <Route path="procuracoes" element={<ListaProcuracoes />} />
        <Route path="requisicoes" element={<ListaRequisicoes />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="aprovacoes" element={<Aprovacoes />} />
        <Route path="insights" element={<Insights />} />
        <Route path="usuarios" element={<GerenciarUsuarios />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
