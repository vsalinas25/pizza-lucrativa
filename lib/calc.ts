/**
 * lib/calc.ts
 * Lógica de precificação e CMV — implementação exata das fórmulas do produto.
 *
 * Terminologia (importante manter consistente na UI, nunca trocar os rótulos):
 * - CMV% = Custo da Mercadoria Vendida como percentual do preço de venda.
 *          Do inglês "Cost of Goods Sold" (COGS); em PT-BR, "Custo da
 *          Mercadoria Vendida". Quanto MENOR, melhor — é o que a pizza
 *          "come" do preço antes de qualquer outra despesa.
 * - Margem de contribuição = o que sobra da venda de UMA pizza depois do
 *          custo direto (ficha técnica) e das taxas do canal, mas ANTES das
 *          despesas fixas do negócio (aluguel, folha, etc). É uma margem
 *          por produto/transação, não do negócio como um todo.
 * - Margem líquida = o que sobra do NEGÓCIO inteiro depois de descontar
 *          CMV total, custos variáveis totais E despesas fixas, sobre a
 *          receita total. É a margem real do caixa.
 *
 * Regra de negócio: NUNCA rotular margem de contribuição como margem
 * líquida ou vice-versa. Confundir as duas é o erro mais comum e mais
 * caro que dono de pizzaria comete ao precificar.
 */

export interface CanalTaxas {
  comissao_percentual: number; // ex: 27 para 27%
  taxa_transacao_percentual: number;
  taxa_marketing_percentual: number;
}

/** Soma de todas as taxas percentuais do canal, como fração (0.34 = 34%) */
export function taxaTotalCanal(canal: CanalTaxas): number {
  const total =
    canal.comissao_percentual +
    canal.taxa_transacao_percentual +
    canal.taxa_marketing_percentual;
  return total / 100;
}

/**
 * CMV% = custo_ficha_tecnica / preco_no_canal
 * Retorna como fração (0.4456 = 44.56%). Multiplique por 100 só na exibição.
 */
export function calcularCMVPercentual(
  custoFichaTecnica: number,
  precoNoCanal: number
): number {
  if (precoNoCanal <= 0) return 0;
  return custoFichaTecnica / precoNoCanal;
}

/**
 * Preço mínimo dado um CMV-alvo = custo_ficha_tecnica / CMV_alvo
 * CMV_alvo deve ser fração (0.30 para 30%), não percentual inteiro.
 */
export function calcularPrecoParaCMVAlvo(
  custoFichaTecnica: number,
  cmvAlvo: number
): number {
  if (cmvAlvo <= 0) return 0;
  return custoFichaTecnica / cmvAlvo;
}

/**
 * Margem de contribuição (por pizza, por canal) =
 *   preco - custo_ficha_tecnica - (preco * taxas_do_canal)
 * Retorna valor absoluto em R$. Para percentual, divida pelo preço.
 */
export function calcularMargemContribuicao(
  preco: number,
  custoFichaTecnica: number,
  canal: CanalTaxas
): number {
  const taxas = taxaTotalCanal(canal);
  return preco - custoFichaTecnica - preco * taxas;
}

export function calcularMargemContribuicaoPercentual(
  preco: number,
  custoFichaTecnica: number,
  canal: CanalTaxas
): number {
  if (preco <= 0) return 0;
  return calcularMargemContribuicao(preco, custoFichaTecnica, canal) / preco;
}

export interface DadosMargemLiquida {
  receitaTotal: number;
  cmvTotal: number;
  custosVariaveisTotais: number; // taxas de canal somadas sobre a receita, ex: comissões pagas
  despesasFixas: number;
}

/**
 * Margem líquida global =
 *   (receita_total - CMV_total - custos_variaveis_totais - despesas_fixas) / receita_total
 * Esta é a margem do NEGÓCIO, não de uma pizza isolada — nunca confundir
 * com margem de contribuição no rótulo da UI.
 */
export function calcularMargemLiquidaGlobal(dados: DadosMargemLiquida): number {
  const { receitaTotal, cmvTotal, custosVariaveisTotais, despesasFixas } = dados;
  if (receitaTotal <= 0) return 0;
  return (
    (receitaTotal - cmvTotal - custosVariaveisTotais - despesasFixas) /
    receitaTotal
  );
}

export type NivelAlerta = "verde" | "amarelo" | "vermelho";

/**
 * Classifica CMV% em faróis visuais. Limiares padrão de mercado de
 * pizzaria (ajustável por configuração futura, hoje fixo):
 * verde  <= 30%  (saudável)
 * amarelo 30–38% (atenção)
 * vermelho > 38% (crítico)
 */
export function classificarCMV(cmvPercentual: number): NivelAlerta {
  const pct = cmvPercentual * 100;
  if (pct <= 30) return "verde";
  if (pct <= 38) return "amarelo";
  return "vermelho";
}

export interface ResultadoSimulacaoPizza {
  pizzaId: string;
  precoAtual: number;
  cmvAtualPercentual: number;
  precoSugeridoParaCMVAlvo: number;
  ultrapassaTetoMercado: boolean;
  alavancasSugeridas: string[];
}

/**
 * Regra do prompt: se o preço calculado para o CMV-alvo ultrapassar o
 * teto_preco_mercado definido pelo usuário, sinalizar e sugerir alavancas
 * alternativas em vez de simplesmente subir o preço.
 */
export function simularPrecoPizza(params: {
  pizzaId: string;
  custoFichaTecnica: number;
  precoAtual: number;
  cmvAlvo: number; // fração, ex: 0.30
  tetoPrecoMercado: number | null;
}): ResultadoSimulacaoPizza {
  const { pizzaId, custoFichaTecnica, precoAtual, cmvAlvo, tetoPrecoMercado } = params;

  const cmvAtualPercentual = calcularCMVPercentual(custoFichaTecnica, precoAtual);
  const precoSugerido = calcularPrecoParaCMVAlvo(custoFichaTecnica, cmvAlvo);

  const ultrapassaTeto =
    tetoPrecoMercado !== null && tetoPrecoMercado > 0 && precoSugerido > tetoPrecoMercado;

  const alavancasSugeridas: string[] = [];
  if (ultrapassaTeto) {
    alavancasSugeridas.push(
      "Reduzir o custo da ficha técnica (renegociar fornecedor, ajustar gramatura, trocar insumo)",
      "Aumentar o volume de vendas dessa pizza para diluir despesas fixas",
      "Reduzir despesas fixas do negócio para folgar a margem líquida",
      "Aceitar CMV mais alto nesta pizza específica e compensar no mix com outras de CMV baixo"
    );
  }

  return {
    pizzaId,
    precoAtual,
    cmvAtualPercentual,
    precoSugeridoParaCMVAlvo: precoSugerido,
    ultrapassaTetoMercado: ultrapassaTeto,
    alavancasSugeridas,
  };
}

/** CMV médio ponderado pelo volume/participação no mix — usado no resumo executivo. */
export function calcularCMVMedioPonderado(
  itens: { cmvPercentual: number; peso: number }[]
): number {
  const pesoTotal = itens.reduce((acc, i) => acc + i.peso, 0);
  if (pesoTotal <= 0) return 0;
  const somaProduto = itens.reduce((acc, i) => acc + i.cmvPercentual * i.peso, 0);
  return somaProduto / pesoTotal;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarPercentual(fracao: number, casasDecimais = 1): string {
  return `${(fracao * 100).toFixed(casasDecimais)}%`;
}
