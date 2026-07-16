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
  const cmvMedio = calcularCMVMedioPonderado(itensCMV);

  const receitaTotal = pizzas.reduce(
    (acc, pizza) => acc + pizza.precos_por_canal.reduce((a, pc) => a + pc.preco_atual, 0),
    0
  );
  const cmvTotal = pizzas.reduce(
    (acc, pizza) =>
      acc + pizza.precos_por_canal.reduce((a) => a + pizza.custo_ficha_tecnica, 0),
    0
  );
  const custosVariaveisTotais = pizzas.reduce((acc, pizza) => {
    return (
      acc +
      pizza.precos_por_canal.reduce((a, pc) => {
        const canal = canais.find((c) => c.id === pc.canal_id);
        if (!canal) return a;
        const taxaFracao =
          (canal.comissao_percentual +
            canal.taxa_transacao_percentual +
            canal.taxa_marketing_percentual) /
          100;
        return a + pc.preco_atual * taxaFracao;
      }, 0)
    );
  }, 0);

  // Mensalidades fixas dos canais (ex: R$110/mês do iFood) entram como
  // despesa fixa do negócio — não são % sobre o preço, então não cabem em
  // custosVariaveisTotais.
  const mensalidadesCanais = canais.reduce((acc, canal) => acc + canal.custo_fixo_mensal, 0);

  const margemLiquida = calcularMargemLiquidaGlobal({
    receitaTotal,
    cmvTotal,
    custosVariaveisTotais,
    despesasFixas: pizzaria.despesas_fixas_mensais + mensalidadesCanais,
  });

  const metaCMV = 0.3; // meta padrão — futuramente configurável por usuário
  const gapCMV = cmvMedio - metaCMV;

  const numeros = [
    { label: "CMV médio ponderado", valor: formatarPercentual(cmvMedio), tom: cmvMedio > 0.38 ? "vermelho" : cmvMedio > 0.3 ? "amarelo" : "verde" },
    { label: "Margem líquida atual", valor: formatarPercentual(margemLiquida), tom: margemLiquida < 0 ? "vermelho" : "verde" },
    { label: "Gap até a meta de CMV", valor: `${gapCMV > 0 ? "+" : ""}${formatarPercentual(gapCMV)}`, tom: gapCMV > 0 ? "amarelo" : "verde" },
    { label: "Despesas fixas / mês", valor: formatarMoeda(pizzaria.despesas_fixas_mensais + mensalidadesCanais), tom: "neutro" },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {numeros.map((n) => (
        <div key={n.label} className="rounded-lg border border-creme-200 p-4">
          <p
            className={`font-mono text-2xl sm:text-3xl font-semibold tabular-nums ${
              n.tom === "vermelho"
                ? "text-sinal-vermelho"
                : n.tom === "amarelo"
                ? "text-sinal-amarelo"
                : n.tom === "verde"
                ? "text-sinal-verde"
                : "text-tinta-950"
            }`}
          >
            {n.valor}
          </p>
          <p className="text-xs text-tinta-400 mt-1">{n.label}</p>
        </div>
      ))}
    </div>
  );
}
