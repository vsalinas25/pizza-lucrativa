/**
 * lib/relatorio.ts
 * Monta os dados do relatório em PDF a partir dos mesmos dados e das mesmas
 * fórmulas usadas no dashboard (lib/calc.ts) — o relatório nunca deve
 * divergir dos números que o dono já vê na tela.
 */
import {
  calcularCMVPercentual,
  calcularMargemContribuicao,
  calcularMargemLiquidaGlobal,
  calcularPrecoParaCMVAlvo,
  classificarCMV,
  type NivelAlerta,
} from "@/lib/calc";
import type { Pizza, CanalVenda, Pizzaria, PrecoPorCanal, NomeCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

const CMV_ALVO = 0.3; // meta saudável padrão usada no resto do produto

export interface ComboRelatorio {
  pizzaNome: string;
  canalNome: string;
  precoAtual: number;
  cmv: number;
  sinal: NivelAlerta;
  sobra: number;
  precoRecomendado: number;
  ultrapassaTeto: boolean;
}

export interface CelulaRelatorio {
  canalNome: string;
  temPreco: boolean;
  precoAtual: number | null;
  cmv: number | null;
  sinal: NivelAlerta | "neutro";
  sobra: number | null;
  precoRecomendado: number | null;
  ultrapassaTeto: boolean;
}

export interface DadosRelatorio {
  pizzariaNome: string;
  cidade: string | null;
  resumoFinanceiro: {
    cmvMedio: number | null;
    margemMediaProjetada: number | null;
    sobraMediaPorPizza: number | null;
    despesasFixasTotais: number;
    breakEven: { unidadesMes: number; unidadesDia: number; baseMedia: number } | null;
    melhorCanal: { nome: string; margemMediaPct: number } | null;
    piorCanal: { nome: string; margemMediaPct: number } | null;
  };
  rentabilidadePorPizza: { pizzaNome: string; custo: number; celulas: CelulaRelatorio[] }[];
  ranking: {
    pioresCombos: ComboRelatorio[];
    melhoresCombos: ComboRelatorio[];
    cmvExcessivo: { pizzaNome: string; cmvMedio: number }[];
    maiorPotencial: (ComboRelatorio & { ganhoPotencial: number })[];
  };
  metas: { label: string; unidadesMes: number; unidadesDia: number; faturamentoResultante: number }[];
  planoDeAcao: string[];
}

/** Distribui o volume mensal real entre pizza×canal, ponderado pela
 * participação de cada canal no mix (normalizada) e igualmente entre as
 * pizzas com preço definido em cada canal — mesma premissa usada no
 * simulador de meta e no resumo executivo, pra manter os três coerentes. */
function construirItensMix(pizzas: PizzaComPrecos[], canais: CanalVenda[], aliquotaImposto: number) {
  const somaMix = canais.reduce((acc, c) => acc + c.percentual_participacao_mix, 0);

  return canais.flatMap((canal) => {
    const pizzasDoCanal = pizzas
      .map((p) => {
        const pc = p.precos_por_canal.find((x) => x.canal_id === canal.id);
        if (!pc || pc.preco_atual <= 0) return null;
        const margem = calcularMargemContribuicao(pc.preco_atual, p.custo_ficha_tecnica, canal, aliquotaImposto);
        return { pizza: p, canal, preco: pc.preco_atual, margem };
      })
      .filter((x): x is { pizza: PizzaComPrecos; canal: CanalVenda; preco: number; margem: number } => x !== null);

    if (pizzasDoCanal.length === 0) return [];

    const pesoCanal = somaMix > 0 ? canal.percentual_participacao_mix / somaMix : 1 / canais.length;
    const pesoItem = pesoCanal / pizzasDoCanal.length;

    return pizzasDoCanal.map((x) => ({ ...x, peso: pesoItem }));
  });
}

function metaPorLucro(
  label: string,
  alvo: number,
  itensMix: ReturnType<typeof construirItensMix>
): { label: string; unidadesMes: number; unidadesDia: number; faturamentoResultante: number } | null {
  const pesoTotal = itensMix.reduce((acc, x) => acc + x.peso, 0);
  if (pesoTotal <= 0 || alvo <= 0) return null;

  const margemMediaPonderada = itensMix.reduce((acc, x) => acc + x.peso * x.margem, 0) / pesoTotal;
  if (margemMediaPonderada <= 0) return null;

  const unidadesMes = Math.ceil(alvo / margemMediaPonderada);
  const precoMedioPonderado = itensMix.reduce((acc, x) => acc + x.peso * x.preco, 0) / pesoTotal;

  return {
    label,
    unidadesMes,
    unidadesDia: Number((unidadesMes / 30).toFixed(1)),
    faturamentoResultante: Math.round(unidadesMes * precoMedioPonderado),
  };
}

export function calcularDadosRelatorio(
  pizzaria: Pizzaria,
  pizzas: PizzaComPrecos[],
  canais: CanalVenda[]
): DadosRelatorio {
  const aliquota = pizzaria.aliquota_imposto;
  const volumePorPizza = pizzas.length > 0 ? pizzaria.volume_mensal_pizzas / pizzas.length : 0;

  // ---- Resumo financeiro: agregado ponderado pelo volume real, igual ao
  // dashboard (ResumoExecutivo) — nunca deixar esse número divergir.
  let receitaTotal = 0;
  let cmvTotal = 0;
  let custosVariaveisTotais = 0;
  const combos: ComboRelatorio[] = [];

  for (const pizza of pizzas) {
    for (const pc of pizza.precos_por_canal) {
      const canal = canais.find((c) => c.id === pc.canal_id);
      if (!canal || pc.preco_atual <= 0) continue;

      const unidades = volumePorPizza * (canal.percentual_participacao_mix / 100);
      const taxaFracao =
        (canal.comissao_percentual + canal.taxa_transacao_percentual + canal.taxa_marketing_percentual) / 100 +
        aliquota / 100;

      receitaTotal += pc.preco_atual * unidades;
      cmvTotal += pizza.custo_ficha_tecnica * unidades;
      custosVariaveisTotais += pc.preco_atual * taxaFracao * unidades;

      const cmv = calcularCMVPercentual(pizza.custo_ficha_tecnica, pc.preco_atual);
      const sobra = calcularMargemContribuicao(pc.preco_atual, pizza.custo_ficha_tecnica, canal, aliquota);
      const precoParaAlvo = calcularPrecoParaCMVAlvo(pizza.custo_ficha_tecnica, CMV_ALVO);
      const precisaAjuste = cmv > CMV_ALVO;
      const ultrapassaTeto =
        precisaAjuste && !!pizza.teto_preco_mercado && precoParaAlvo > pizza.teto_preco_mercado;
      const precoRecomendado = !precisaAjuste
        ? pc.preco_atual
        : ultrapassaTeto
        ? pizza.teto_preco_mercado!
        : precoParaAlvo;

      combos.push({
        pizzaNome: pizza.nome,
        canalNome: canal.nome,
        precoAtual: pc.preco_atual,
        cmv,
        sinal: classificarCMV(cmv),
        sobra,
        precoRecomendado,
        ultrapassaTeto,
      });
    }
  }

  const mensalidadesCanais = canais.reduce((acc, c) => acc + c.custo_fixo_mensal, 0);
  const despesasFixasTotais = pizzaria.despesas_fixas_mensais + mensalidadesCanais;
  const temDados = receitaTotal > 0;

  const cmvMedio = temDados ? cmvTotal / receitaTotal : null;
  const margemMediaProjetada = temDados
    ? calcularMargemLiquidaGlobal({ receitaTotal, cmvTotal, custosVariaveisTotais, despesasFixas: despesasFixasTotais })
    : null;
  const sobraMediaPorPizza =
    combos.length > 0 ? combos.reduce((acc, c) => acc + c.sobra, 0) / combos.length : null;

  // ---- Melhor / pior canal: margem % média entre as pizzas com preço nele
  const porCanal = canais
    .map((canal) => {
      const combosDoCanal = combos.filter((c) => c.canalNome === canal.nome);
      if (combosDoCanal.length === 0) return null;
      const margemPctMedia =
        combosDoCanal.reduce((acc, c) => acc + (c.precoAtual > 0 ? c.sobra / c.precoAtual : 0), 0) /
        combosDoCanal.length;
      return { nome: canal.nome, margemMediaPct: margemPctMedia };
    })
    .filter((x): x is { nome: NomeCanal; margemMediaPct: number } => x !== null);

  const melhorCanal = porCanal.length > 0 ? porCanal.reduce((a, b) => (b.margemMediaPct > a.margemMediaPct ? b : a)) : null;
  const piorCanal = porCanal.length > 0 ? porCanal.reduce((a, b) => (b.margemMediaPct < a.margemMediaPct ? b : a)) : null;

  // ---- Break-even (mix atual)
  const itensMix = construirItensMix(pizzas, canais, aliquota);
  const breakEvenBruto = metaPorLucro("Break-even", despesasFixasTotais, itensMix);
  const pesoTotalMix = itensMix.reduce((acc, x) => acc + x.peso, 0);
  const margemMediaPonderadaMix =
    pesoTotalMix > 0 ? itensMix.reduce((acc, x) => acc + x.peso * x.margem, 0) / pesoTotalMix : 0;
  const breakEven =
    breakEvenBruto && despesasFixasTotais > 0
      ? { unidadesMes: breakEvenBruto.unidadesMes, unidadesDia: breakEvenBruto.unidadesDia, baseMedia: margemMediaPonderadaMix }
      : null;

  // ---- Rentabilidade pizza × canal (grade completa, inclusive sem preço)
  const rentabilidadePorPizza = pizzas.map((pizza) => ({
    pizzaNome: pizza.nome,
    custo: pizza.custo_ficha_tecnica,
    celulas: canais.map((canal) => {
      const combo = combos.find((c) => c.pizzaNome === pizza.nome && c.canalNome === canal.nome);
      if (!combo) {
        return {
          canalNome: canal.nome,
          temPreco: false,
          precoAtual: null,
          cmv: null,
          sinal: "neutro" as const,
          sobra: null,
          precoRecomendado: null,
          ultrapassaTeto: false,
        };
      }
      return {
        canalNome: canal.nome,
        temPreco: true,
        precoAtual: combo.precoAtual,
        cmv: combo.cmv,
        sinal: combo.sinal,
        sobra: combo.sobra,
        precoRecomendado: combo.precoRecomendado,
        ultrapassaTeto: combo.ultrapassaTeto,
      };
    }),
  }));

  // ---- Rankings
  const pioresCombos = [...combos].sort((a, b) => b.cmv - a.cmv).slice(0, 8);
  const melhoresCombos = [...combos].sort((a, b) => b.sobra - a.sobra).slice(0, 8);

  const cmvPorPizza = pizzas
    .map((pizza) => {
      const combosDaPizza = combos.filter((c) => c.pizzaNome === pizza.nome);
      if (combosDaPizza.length === 0) return null;
      const cmvMedioPizza = combosDaPizza.reduce((acc, c) => acc + c.cmv, 0) / combosDaPizza.length;
      return { pizzaNome: pizza.nome, cmvMedio: cmvMedioPizza };
    })
    .filter((x): x is { pizzaNome: string; cmvMedio: number } => x !== null);
  const cmvExcessivo = cmvPorPizza.filter((p) => p.cmvMedio > 0.38).sort((a, b) => b.cmvMedio - a.cmvMedio);

  const maiorPotencial = combos
    .filter((c) => c.precoRecomendado > c.precoAtual)
    .map((c) => ({ ...c, ganhoPotencial: c.precoRecomendado - c.precoAtual }))
    .sort((a, b) => b.ganhoPotencial - a.ganhoPotencial)
    .slice(0, 6);

  // ---- Metas de venda (mix atual de pizzas/canais)
  const metas = [
    despesasFixasTotais > 0 ? metaPorLucro("Cobrir despesas fixas (break-even)", despesasFixasTotais, itensMix) : null,
    metaPorLucro("R$10.000 de lucro", 10000, itensMix),
    metaPorLucro("R$20.000 de lucro", 20000, itensMix),
    metaPorLucro("R$30.000 de lucro", 30000, itensMix),
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  // ---- Plano de ação: até 5 recomendações concretas geradas dos dados
  const planoDeAcao: string[] = [];
  const jaMencionados = new Set<string>();

  for (const combo of pioresCombos) {
    if (planoDeAcao.length >= 3) break;
    const chave = `${combo.pizzaNome}-${combo.canalNome}`;
    if (jaMencionados.has(chave) || combo.precoRecomendado <= combo.precoAtual) continue;
    jaMencionados.add(chave);
    planoDeAcao.push(
      `Aumente a ${combo.pizzaNome} no ${combo.canalNome} de R$${combo.precoAtual.toFixed(2)} para R$${combo.precoRecomendado.toFixed(
        2
      )} — CMV cai de ${(combo.cmv * 100).toFixed(1)}% para perto de 30%.`
    );
  }

  const piorSemAjustePreco = pioresCombos.find(
    (c) => c.ultrapassaTeto && !jaMencionados.has(`${c.pizzaNome}-${c.canalNome}`)
  );
  if (piorSemAjustePreco && planoDeAcao.length < 5) {
    planoDeAcao.push(
      `Revise o CMV (ficha técnica/fornecedor) da ${piorSemAjustePreco.pizzaNome} — no ${piorSemAjustePreco.canalNome} o preço já está no teto de mercado e ainda assim o CMV fica em ${(
        piorSemAjustePreco.cmv * 100
      ).toFixed(1)}%.`
    );
  }

  if (cmvExcessivo.length > 0 && planoDeAcao.length < 5) {
    const pior = cmvExcessivo[0];
    if (!planoDeAcao.some((p) => p.includes(pior.pizzaNome))) {
      planoDeAcao.push(
        `Revise o custo da ${pior.pizzaNome} — CMV médio de ${(pior.cmvMedio * 100).toFixed(1)}% em todos os canais, bem acima do saudável (30%).`
      );
    }
  }

  if (melhorCanal && piorCanal && melhorCanal.nome !== piorCanal.nome && planoDeAcao.length < 5) {
    planoDeAcao.push(
      `Priorize o canal ${melhorCanal.nome} quando possível — sobra em média ${(
        (melhorCanal.margemMediaPct - piorCanal.margemMediaPct) *
        100
      ).toFixed(1)} pontos percentuais a mais que ${piorCanal.nome}.`
    );
  }

  if (planoDeAcao.length === 0) {
    planoDeAcao.push("Nenhum ajuste urgente identificado com os dados atuais — continue monitorando o CMV mensalmente.");
  }

  return {
    pizzariaNome: pizzaria.nome,
    cidade: pizzaria.cidade,
    resumoFinanceiro: {
      cmvMedio,
      margemMediaProjetada,
      sobraMediaPorPizza,
      despesasFixasTotais,
      breakEven,
      melhorCanal,
      piorCanal,
    },
    rentabilidadePorPizza,
    ranking: { pioresCombos, melhoresCombos, cmvExcessivo, maiorPotencial },
    metas,
    planoDeAcao: planoDeAcao.slice(0, 5),
  };
}
