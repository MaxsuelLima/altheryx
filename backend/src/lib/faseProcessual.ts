import { FaseProcessual } from "@prisma/client";

const PADROES_FASE: { fase: FaseProcessual; palavras: RegExp }[] = [
  { fase: "ENCERRADO", palavras: /tr[aâ]nsito\s*em\s*julgado|baixa\s*definitiva|arquivamento\s*definitivo/i },
  { fase: "CUMPRIMENTO_SENTENCA", palavras: /cumprimento\s*de\s*senten[cç]a|execu[cç][aã]o\s*de\s*senten[cç]a|impugna[cç][aã]o\s*ao\s*cumprimento/i },
  { fase: "EXECUCAO", palavras: /fase\s*de\s*execu[cç][aã]o|penhora|avalia[cç][aã]o\s*de\s*bens|hasta\s*p[uú]blica|leil[aã]o/i },
  { fase: "RECURSAL", palavras: /apela[cç][aã]o|recurso|agravo|embargos?\s*(de\s*declara[cç][aã]o|infringentes)|contrarraz[oõ]es/i },
  { fase: "JULGAMENTO", palavras: /senten[cç]a|julgamento|ac[oó]rd[aã]o|voto|conclusos?\s*para\s*julgamento/i },
  { fase: "INSTRUCAO", palavras: /audi[eê]ncia|per[ií]cia|laudo|prova|testemunha|depoimento|instru[cç][aã]o|especifica[cç][aã]o\s*de\s*provas/i },
  { fase: "CONHECIMENTO", palavras: /cita[cç][aã]o|contesta[cç][aã]o|r[eé]plica|inicial|distribui[cç][aã]o|emenda/i },
];

export function detectarFase(descricao: string): FaseProcessual | null {
  for (const padrao of PADROES_FASE) {
    if (padrao.palavras.test(descricao)) {
      return padrao.fase;
    }
  }
  return null;
}

const INDICES_CORRECAO: Record<string, number> = {
  "INPC": 0.0045,
  "IPCA-E": 0.0042,
  "IGPM": 0.0038,
  "TR": 0.0010,
  "SELIC": 0.0085,
};

export function calcularCorrecaoMonetaria(
  valor: number,
  indice: string,
  meses: number
): { valorCorrigido: number; indiceAplicado: number; indiceMensal: number } {
  const indiceMensal = INDICES_CORRECAO[indice] || 0;
  const indiceAplicado = Math.pow(1 + indiceMensal, meses) - 1;
  const valorCorrigido = valor * (1 + indiceAplicado);

  return {
    valorCorrigido: Math.round(valorCorrigido * 100) / 100,
    indiceAplicado: Math.round(indiceAplicado * 10000) / 10000,
    indiceMensal,
  };
}

export const INDICES_DISPONIVEIS = Object.keys(INDICES_CORRECAO);
