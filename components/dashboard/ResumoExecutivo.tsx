import {
  calcularCMVMedioPonderado,
  calcularCMVPercentual,
  calcularMargemLiquidaGlobal,
  formatarPercentual,
  formatarMoeda,
} from "@/lib/calc";
import type { Pizza, CanalVenda, Pizzaria, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

export default function ResumoExecutivo({
  pizzaria,
  pizzas,
  canais,
}: {
  pizzaria: Pizzaria;
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const itensCMV = pizzas.flatMap((pizza) =>
    pizza.precos_por_canal.map((pc) => ({
      cmvPercentual: calcularCMVPercentual(pizza.custo_ficha_tecnica, pc.preco_atual),
      peso: 1,
    }))
  );
  const temPrecosDefinidos = itensCMV.length > 0;
  const cmvMedio = calcularCMVMedioPonderado(itensCMV);

  // Estimativa de receita/CMV/custos variáveis a partir do volume mensal
  // real (pizzaria.volume_mensal_pizzas), distribuído igualmente entre as
  // pizzas cadastradas e ponderado pela participação de cada canal no mix
  // (canal.percentual_participacao_mix). Sem isso, somar preços unitários
  // brutos como se cada combinação pizza×canal fosse "1 venda" produz
  // margem líquida sem nenhum sentido (ex: -19000%) assim que comparada às
  // despesas fixas mensais reais.
  const volumePorPizza = pizzas.length > 0 ? pizzaria.volume_mensal_pizzas / pizzas.length : 0;

  let receitaTotal = 0;
  let cmvTotal = 0;
  let custosVariaveisTotais = 0;

  for (const pizza of pizzas) {
    for (const pc of pizza.precos_por_canal) {
      const canal = canais.find((c) => c.id === pc.canal_id);
      if (!canal || pc.preco_atual <= 0) continue;

      const unidades = volumePorPizza * (canal.percentual_participacao_mix / 100);
      const taxaFracao =
        (canal.comissao_percentual + canal.taxa_transacao_percentual + canal.taxa_marketing_percentual) /
        100;

      receitaTotal += pc.preco_atual * unidades;
      cmvTotal += pizza.custo_ficha_tecnica * unidades;
      custosVariaveisTotais += pc.preco_atual * taxaFracao * unidades;
    }
  }

  // Mensalidades fixas dos canais (ex: R$110/mês do iFood) entram como
  // despesa fixa do negócio — não são % sobre o preço, então não cabem em
  // custosVariaveisTotais.
  const mensalidadesCanais = canais.reduce((acc, canal) => acc + canal.custo_fixo_mensal, 0);
  const despesasFixasTotais = pizzaria.despesas_fixas_mensais + mensalidadesCanais;

  const temDadosSuficientes = pizzaria.volume_mensal_pizzas > 0 && receitaTotal > 0;

  const margemLiquida = temDadosSuficientes
    ? calcularMargemLiquidaGlobal({
        receitaTotal,
        cmvTotal,
        custosVariaveisTotais,
        despesasFixas: despesasFixasTotais,
      })
    : null;

  const metaCMV = 0.3; // meta padrão — futuramente configurável por usuário
  const gapCMV = cmvMedio - metaCMV;

  const destaque = {
    label: "CMV médio ponderado",
    valor: temPrecosDefinidos ? formatarPercentual(cmvMedio) : "—",
    tom: !temPrecosDefinidos
      ? "neutro"
      : cmvMedio > 0.38
      ? "vermelho"
      : cmvMedio > 0.3
      ? "amarelo"
      : "verde",
  } as const;

  const numeros = [
    {
      label: "Margem líquida atual",
      valor: margemLiquida !== null ? formatarPercentual(margemLiquida) : "—",
      tom: margemLiquida === null ? "neutro" : margemLiquida < 0 ? "vermelho" : "verde",
    },
    {
      label: "Gap até a meta de CMV",
      valor: temPrecosDefinidos ? `${gapCMV > 0 ? "+" : ""}${formatarPercentual(gapCMV)}` : "—",
      tom: !temPrecosDefinidos ? "neutro" : gapCMV > 0 ? "amarelo" : "verde",
    },
    { label: "Despesas fixas / mês", valor: formatarMoeda(despesasFixasTotais), tom: "neutro" },
  ] as const;

  const corTom = (tom: string) =>
    tom === "vermelho"
      ? "text-sinal-vermelho"
      : tom === "amarelo"
      ? "text-sinal-amarelo"
      : tom === "verde"
      ? "text-sinal-verde"
      : "text-tinta-950";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 sm:grid-rows-2 gap-4">
      <div className="sm:col-span-2 sm:row-span-2 rounded-xl border border-menta-100 bg-gradient-to-br from-menta-50 to-white p-6 flex flex-col justify-between shadow-soft">
        <p className="text-sm text-tinta-400">{destaque.label}</p>
        <p className={`font-mono text-5xl sm:text-6xl font-semibold tabular-nums ${corTom(destaque.tom)}`}>
          {destaque.valor}
        </p>
        <p className="text-xs text-tinta-400">
          {temPrecosDefinidos ? "Meta saudável: até 30%" : "Defina o preço de ao menos uma pizza para calcular"}
        </p>
      </div>
      {numeros.map((n) => (
        <div key={n.label} className="rounded-xl border border-creme-200 bg-white p-4 shadow-soft">
          <p className={`font-mono text-2xl sm:text-3xl font-semibold tabular-nums ${corTom(n.tom)}`}>
            {n.valor}
          </p>
          <p className="text-xs text-tinta-400 mt-1">
            {n.label}
            {n.label === "Margem líquida atual" && margemLiquida === null && (
              <span className="block text-[11px] mt-0.5">
                Preencha o volume mensal de pizzas em Configurações
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
