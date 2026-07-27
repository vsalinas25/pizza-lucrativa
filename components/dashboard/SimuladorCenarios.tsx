"use client";

import { useMemo, useState } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { formatarMoeda } from "@/lib/calc";
import type { Pizza, CanalVenda, Pizzaria, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };
type Driver = "cmv" | "margem";

/**
 * Modelo agregado do negócio (não por pizza): dado um faturamento, uma
 * taxa média de canal, um imposto sobre a venda e despesas fixas, CMV% e
 * margem líquida% são as duas faces da mesma equação —
 *   margemLiquida = 1 - CMV - taxaMedia - imposto - despesasFixas/faturamento
 * — por isso só faz sentido travar UMA das duas como "entrada" por vez; a
 * outra é sempre derivada. É exatamente essa a mecânica que o dono pediu:
 * mexer no CMV recalcula a margem, mexer na margem recalcula o CMV
 * necessário, mantendo as outras premissas fixas.
 */
function calcularMargemLiquida(params: {
  cmvFracao: number;
  taxaMediaFracao: number;
  impostoFracao: number;
  despesasFixas: number;
  faturamento: number;
}): number {
  const { cmvFracao, taxaMediaFracao, impostoFracao, despesasFixas, faturamento } = params;
  if (faturamento <= 0) return 0;
  return 1 - cmvFracao - taxaMediaFracao - impostoFracao - despesasFixas / faturamento;
}

function calcularCMVNecessario(params: {
  margemFracao: number;
  taxaMediaFracao: number;
  impostoFracao: number;
  despesasFixas: number;
  faturamento: number;
}): number {
  const { margemFracao, taxaMediaFracao, impostoFracao, despesasFixas, faturamento } = params;
  if (faturamento <= 0) return 0;
  return 1 - margemFracao - taxaMediaFracao - impostoFracao - despesasFixas / faturamento;
}

export default function SimuladorCenarios({
  pizzaria,
  pizzas,
  canais,
}: {
  pizzaria: Pizzaria;
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  // Baseline calculado a partir dos dados reais — igual ao resumo
  // executivo, mas usado só como ponto de partida do cenário hipotético.
  const baseline = useMemo(() => {
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

    const mensalidadesCanais = canais.reduce((acc, c) => acc + c.custo_fixo_mensal, 0);
    const despesasFixasTotais = pizzaria.despesas_fixas_mensais + mensalidadesCanais;

    const temDados = receitaTotal > 0;

    return {
      faturamento: temDados ? Math.round(receitaTotal) : 10000,
      taxaMediaPct: temDados ? Number(((custosVariaveisTotais / receitaTotal) * 100).toFixed(1)) : 10,
      impostoPct: pizzaria.aliquota_imposto,
      despesasFixas: despesasFixasTotais,
      volumeMensal: pizzaria.volume_mensal_pizzas || 300,
      cmvPct: temDados ? Number(((cmvTotal / receitaTotal) * 100).toFixed(1)) : 30,
    };
  }, [pizzaria, pizzas, canais]);

  const [driver, setDriver] = useState<Driver>("cmv");
  const [faturamento, setFaturamento] = useState(baseline.faturamento);
  const [taxaMediaPct, setTaxaMediaPct] = useState(baseline.taxaMediaPct);
  const [impostoPct, setImpostoPct] = useState(baseline.impostoPct);
  const [despesasFixas, setDespesasFixas] = useState(baseline.despesasFixas);
  const [volumeMensal, setVolumeMensal] = useState(baseline.volumeMensal);
  const [cmvPct, setCmvPct] = useState(baseline.cmvPct);
  const [margemPct, setMargemPct] = useState(() =>
    Number(
      (
        calcularMargemLiquida({
          cmvFracao: baseline.cmvPct / 100,
          taxaMediaFracao: baseline.taxaMediaPct / 100,
          impostoFracao: baseline.impostoPct / 100,
          despesasFixas: baseline.despesasFixas,
          faturamento: baseline.faturamento,
        }) * 100
      ).toFixed(1)
    )
  );

  function resetar() {
    setDriver("cmv");
    setFaturamento(baseline.faturamento);
    setTaxaMediaPct(baseline.taxaMediaPct);
    setImpostoPct(baseline.impostoPct);
    setDespesasFixas(baseline.despesasFixas);
    setVolumeMensal(baseline.volumeMensal);
    setCmvPct(baseline.cmvPct);
  }

  // O valor "não travado" (CMV ou margem, dependendo do driver) é sempre
  // recalculado a partir do outro + das premissas atuais — nunca guardado
  // como estado próprio, pra não desincronizar.
  const margemCalculada = calcularMargemLiquida({
    cmvFracao: cmvPct / 100,
    taxaMediaFracao: taxaMediaPct / 100,
    impostoFracao: impostoPct / 100,
    despesasFixas,
    faturamento,
  });
  const cmvCalculado = calcularCMVNecessario({
    margemFracao: margemPct / 100,
    taxaMediaFracao: taxaMediaPct / 100,
    impostoFracao: impostoPct / 100,
    despesasFixas,
    faturamento,
  });

  const cmvExibido = driver === "cmv" ? cmvPct : cmvCalculado * 100;
  const margemExibida = driver === "margem" ? margemPct : margemCalculada * 100;

  const lucroLiquidoMensal = (margemExibida / 100) * faturamento;
  const custoTotalMensal = (cmvExibido / 100) * faturamento;
  const custosVariaveisMensal = (taxaMediaPct / 100) * faturamento;
  const lucroPorPizza = volumeMensal > 0 ? lucroLiquidoMensal / volumeMensal : null;
  const precoMedioImplicito = volumeMensal > 0 ? faturamento / volumeMensal : null;

  const cmvImpossivel = cmvExibido < 0 || cmvExibido > 100;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-dashed border-indigo-400/50 bg-indigo-50/40 p-4 flex items-start gap-3">
        <FlaskConical className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-semibold text-tinta-950">Cenário hipotético</p>
          <p className="text-sm text-tinta-700">
            Tudo aqui é uma simulação — os números partem dos seus dados reais, mas nada é salvo nem afeta seu
            dashboard. Mude qualquer indicador à vontade pra ver "e se".
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-creme-200 bg-white shadow-soft p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">O que eu quero ajustar?</h2>
          <button
            onClick={resetar}
            className="flex items-center gap-1.5 text-xs text-tinta-400 hover:text-tinta-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resetar pros dados reais
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDriver("cmv")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              driver === "cmv" ? "bg-menta-500 text-white" : "bg-creme-50 text-tinta-700 hover:bg-creme-100"
            }`}
          >
            Eu mexo no CMV
          </button>
          <button
            onClick={() => setDriver("margem")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              driver === "margem" ? "bg-menta-500 text-white" : "bg-creme-50 text-tinta-700 hover:bg-creme-100"
            }`}
          >
            Eu mexo na margem líquida
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={driver !== "cmv" ? "opacity-50" : ""}>
            <label className="text-xs text-tinta-400 block mb-1.5">
              CMV médio {driver === "cmv" ? "(você define)" : "(calculado)"}:{" "}
              <span className="font-mono text-menta-600">{cmvExibido.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={0.5}
              disabled={driver !== "cmv"}
              value={driver === "cmv" ? cmvPct : cmvExibido}
              onChange={(e) => setCmvPct(Number(e.target.value))}
              className="w-full accent-menta-500 disabled:accent-tinta-400"
            />
          </div>
          <div className={driver !== "margem" ? "opacity-50" : ""}>
            <label className="text-xs text-tinta-400 block mb-1.5">
              Margem líquida {driver === "margem" ? "(você define)" : "(calculada)"}:{" "}
              <span className="font-mono text-menta-600">{margemExibida.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={-30}
              max={50}
              step={0.5}
              disabled={driver !== "margem"}
              value={driver === "margem" ? margemPct : margemExibida}
              onChange={(e) => setMargemPct(Number(e.target.value))}
              className="w-full accent-menta-500 disabled:accent-tinta-400"
            />
          </div>
        </div>

        {cmvImpossivel && (
          <div className="rounded-md border border-sinal-vermelho/40 bg-sinal-vermelho/10 p-3">
            <p className="text-sinal-vermelho text-xs font-semibold">
              Pra essa margem líquida, com essas premissas, o CMV precisaria ser {cmvExibido.toFixed(1)}% — fora
              do intervalo possível (0–100%). Ajuste taxa média, despesas fixas ou faturamento abaixo.
            </p>
          </div>
        )}

        <div className="h-px bg-creme-200" />

        <p className="text-xs text-tinta-400 uppercase tracking-wide">Premissas do cenário</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-tinta-400 block mb-1.5">Faturamento mensal estimado (R$)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={faturamento}
              onChange={(e) => setFaturamento(Number(e.target.value) || 0)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1.5">
              Taxa média de canal: <span className="font-mono text-tinta-700">{taxaMediaPct.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={35}
              step={0.5}
              value={taxaMediaPct}
              onChange={(e) => setTaxaMediaPct(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1.5">
              Imposto sobre vendas: <span className="font-mono text-tinta-700">{impostoPct.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={impostoPct}
              onChange={(e) => setImpostoPct(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1.5">Despesas fixas mensais (R$)</label>
            <input
              type="number"
              min="0"
              step="50"
              value={despesasFixas}
              onChange={(e) => setDespesasFixas(Number(e.target.value) || 0)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1.5">Volume mensal estimado (pizzas)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={volumeMensal}
              onChange={(e) => setVolumeMensal(Number(e.target.value) || 0)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-creme-200 bg-white shadow-soft p-5">
        <h2 className="font-display text-lg font-semibold mb-4">Resultado do cenário</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="rounded-md bg-creme-50 p-3">
            <p
              className={`font-mono text-xl font-semibold tabular-nums ${
                margemExibida < 0 ? "text-sinal-vermelho" : "text-sinal-verde"
              }`}
            >
              {formatarMoeda(lucroLiquidoMensal)}
            </p>
            <p className="text-[11px] text-tinta-400 mt-0.5">Lucro líquido / mês</p>
          </div>
          <div className="rounded-md bg-creme-50 p-3">
            <p className="font-mono text-xl font-semibold text-tinta-950 tabular-nums">
              {formatarMoeda(custoTotalMensal)}
            </p>
            <p className="text-[11px] text-tinta-400 mt-0.5">Custo total (CMV) / mês</p>
          </div>
          <div className="rounded-md bg-creme-50 p-3">
            <p className="font-mono text-xl font-semibold text-tinta-950 tabular-nums">
              {formatarMoeda(custosVariaveisMensal)}
            </p>
            <p className="text-[11px] text-tinta-400 mt-0.5">Taxas de canal / mês</p>
          </div>
          <div className="rounded-md bg-creme-50 p-3">
            <p className="font-mono text-xl font-semibold text-tinta-950 tabular-nums">
              {formatarMoeda((impostoPct / 100) * faturamento)}
            </p>
            <p className="text-[11px] text-tinta-400 mt-0.5">Imposto / mês</p>
          </div>
          <div className="rounded-md bg-creme-50 p-3">
            <p className="font-mono text-xl font-semibold text-tinta-950 tabular-nums">
              {precoMedioImplicito !== null ? formatarMoeda(precoMedioImplicito) : "—"}
            </p>
            <p className="text-[11px] text-tinta-400 mt-0.5">Preço médio implícito</p>
          </div>
        </div>
        {lucroPorPizza !== null && (
          <p className="text-xs text-tinta-400 mt-3">
            ≈ <span className="font-mono text-tinta-700">{formatarMoeda(lucroPorPizza)}</span> de lucro por
            pizza vendida, nesse cenário.
          </p>
        )}
      </div>
    </div>
  );
}
