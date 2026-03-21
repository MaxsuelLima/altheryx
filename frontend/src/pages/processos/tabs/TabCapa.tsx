interface Processo {
  numeroProcesso: string;
  status: string;
  tribunal: string;
  competencia: string | null;
  assunto: string;
  valorCausa: string | null;
  segredoJustica: boolean;
  tutelaLiminar: boolean;
  ultimaMovimentacao: string | null;
  observacoes: string | null;
  advogado: { nome: string; oab: string } | null;
  juiz: { nome: string; tribunal: string | null; vara: string | null } | null;
}

const statusLabels: Record<string, string> = {
  EM_ANDAMENTO: "Em Andamento",
  SUSPENSO: "Suspenso",
  ARQUIVADO: "Arquivado",
  ENCERRADO: "Encerrado",
  AGUARDANDO_JULGAMENTO: "Aguardando Julgamento",
};

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{valor || "—"}</dd>
    </div>
  );
}

export default function TabCapa({ processo }: { processo: Processo }) {
  const formatCurrency = (val: string | null) => {
    if (!val) return "—";
    return `R$ ${parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (val: string | null) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Capa</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Campo label="Número do Processo" valor={processo.numeroProcesso} />
        <Campo label="Status" valor={statusLabels[processo.status] || processo.status} />
        <Campo label="Tribunal" valor={processo.tribunal} />
        <Campo label="Competência" valor={processo.competencia} />
        <Campo label="Assunto" valor={processo.assunto} />
        <Campo label="Valor da Causa" valor={formatCurrency(processo.valorCausa)} />
        <Campo label="Segredo de Justiça" valor={processo.segredoJustica ? "Sim" : "Não"} />
        <Campo label="Tutela/Liminar" valor={processo.tutelaLiminar ? "Sim" : "Não"} />
        <Campo label="Última Movimentação" valor={formatDate(processo.ultimaMovimentacao)} />
        <Campo label="Advogado" valor={processo.advogado ? `${processo.advogado.nome} (${processo.advogado.oab})` : null} />
        <Campo label="Juiz" valor={processo.juiz ? `${processo.juiz.nome}${processo.juiz.vara ? ` - ${processo.juiz.vara}` : ""}` : null} />
      </dl>
      {processo.observacoes && (
        <div className="mt-6 border-t pt-4">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</dt>
          <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{processo.observacoes}</dd>
        </div>
      )}
    </div>
  );
}
