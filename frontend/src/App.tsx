import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/processos" element={<ListaProcessos />} />
        <Route path="/processos/:id" element={<DetalheProcesso />} />

        <Route path="/clientes" element={<ListaClientes />} />
        <Route path="/escritorios" element={<ListaEscritorios />} />
        <Route path="/advogados" element={<ListaAdvogados />} />
        <Route path="/juizes" element={<ListaJuizes />} />
        <Route path="/testemunhas" element={<ListaTestemunhas />} />
        <Route path="/peritos" element={<ListaPeritos />} />
        <Route path="/prepostos" element={<ListaPrepostos />} />

        <Route path="/publicacoes" element={<Publicacoes />} />
        <Route path="/prazos" element={<GestaoPrazos />} />
        <Route path="/calendario" element={<CalendarioTribunais />} />

        <Route path="/procuracoes" element={<ListaProcuracoes />} />
        <Route path="/requisicoes" element={<ListaRequisicoes />} />

        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/aprovacoes" element={<Aprovacoes />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Layout>
  );
}
