import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ListaClientes from "./pages/clientes/ListaClientes";
import FormCliente from "./pages/clientes/FormCliente";
import ListaEscritorios from "./pages/escritorios/ListaEscritorios";
import FormEscritorio from "./pages/escritorios/FormEscritorio";
import ListaAdvogados from "./pages/advogados/ListaAdvogados";
import FormAdvogado from "./pages/advogados/FormAdvogado";
import ListaJuizes from "./pages/juizes/ListaJuizes";
import FormJuiz from "./pages/juizes/FormJuiz";
import ListaTestemunhas from "./pages/testemunhas/ListaTestemunhas";
import FormTestemunha from "./pages/testemunhas/FormTestemunha";
import ListaProcessos from "./pages/processos/ListaProcessos";
import FormProcesso from "./pages/processos/FormProcesso";
import DetalheProcesso from "./pages/processos/DetalheProcesso";
import Insights from "./pages/Insights";
import Publicacoes from "./pages/publicacoes/Publicacoes";
import GestaoPrazos from "./pages/prazos/GestaoPrazos";
import CalendarioTribunais from "./pages/calendario/CalendarioTribunais";
import ListaProcuracoes from "./pages/procuracoes/ListaProcuracoes";
import FormProcuracao from "./pages/procuracoes/FormProcuracao";
import ListaRequisicoes from "./pages/requisicoes/ListaRequisicoes";
import FormRequisicao from "./pages/requisicoes/FormRequisicao";
import Relatorios from "./pages/relatorios/Relatorios";
import Aprovacoes from "./pages/aprovacoes/Aprovacoes";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/processos" element={<ListaProcessos />} />
        <Route path="/processos/novo" element={<FormProcesso />} />
        <Route path="/processos/:id" element={<DetalheProcesso />} />
        <Route path="/processos/:id/editar" element={<FormProcesso />} />

        <Route path="/clientes" element={<ListaClientes />} />
        <Route path="/clientes/novo" element={<FormCliente />} />
        <Route path="/clientes/:id" element={<FormCliente />} />

        <Route path="/escritorios" element={<ListaEscritorios />} />
        <Route path="/escritorios/novo" element={<FormEscritorio />} />
        <Route path="/escritorios/:id" element={<FormEscritorio />} />

        <Route path="/advogados" element={<ListaAdvogados />} />
        <Route path="/advogados/novo" element={<FormAdvogado />} />
        <Route path="/advogados/:id" element={<FormAdvogado />} />

        <Route path="/juizes" element={<ListaJuizes />} />
        <Route path="/juizes/novo" element={<FormJuiz />} />
        <Route path="/juizes/:id" element={<FormJuiz />} />

        <Route path="/testemunhas" element={<ListaTestemunhas />} />
        <Route path="/testemunhas/novo" element={<FormTestemunha />} />
        <Route path="/testemunhas/:id" element={<FormTestemunha />} />

        <Route path="/publicacoes" element={<Publicacoes />} />

        <Route path="/prazos" element={<GestaoPrazos />} />

        <Route path="/calendario" element={<CalendarioTribunais />} />

        <Route path="/procuracoes" element={<ListaProcuracoes />} />
        <Route path="/procuracoes/novo" element={<FormProcuracao />} />
        <Route path="/procuracoes/:id" element={<FormProcuracao />} />

        <Route path="/requisicoes" element={<ListaRequisicoes />} />
        <Route path="/requisicoes/novo" element={<FormRequisicao />} />
        <Route path="/requisicoes/:id" element={<FormRequisicao />} />

        <Route path="/relatorios" element={<Relatorios />} />

        <Route path="/aprovacoes" element={<Aprovacoes />} />

        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Layout>
  );
}
