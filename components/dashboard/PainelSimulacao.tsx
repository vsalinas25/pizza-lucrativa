"use client";

import { useEffect, useMemo, useState } from "react";
import {
  simularPrecoPizza,
  calcularMargemContribuicao,
  calcularMargemContribuicaoPercentual,
  formatarMoeda,
  formatarPercentual,
} from "@/lib/calc";
import type { Pizza, CanalVenda, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

export default function PainelSimulacao({
  pizzas,
  canais,
}: {
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const [cmvAlvoPct, setCmvAlvoPct] = useState(30);
  const [pizzaSelecionadaId, setPizzaSelecionadaId] = useState(pizzas[0]?.id ?? "");
  const [canalSelecionadoId, setCanalSelecionadoId] = useState(canais[0]?.id ?? "");

  // Mesma sincronização defensiva do ComparativoCanais: sem isso, a
  // primeira pizza/canal criados não aparecem selecionados até um reload
  // manual da página.
  useEffect(() => {
    if (pizzas.length > 0 && !pizzas.some((p) => p.id === pizzaSelecionadaId)) {
      setPizzaSelecionadaId(pizzas[0].id);
    }
  }, [pizzas, pizzaSelecionadaId]);

  useEffect(() => {
    if (canais.length > 0 && !canais.some((c) => c.id === canalSelecionadoId)) {
      setCanalSelecionadoId(canais[0].id);
    }
  }, [canais, canalSelecionadoId]);

  const pizza = pizzas.find((p) => p.id === pizzaSelecionadaId);
  const preco = pizza?.precos_por_canal.find((pc) => pc.canal_id === canalSelecionadoId);
  const canal = canais.find((c) => c.id === canalSelecionadoId);

  const resultado = useMemo(() => {
    if (!pizza) return null;
    return simularPrecoPizza({
      pizzaId: pizza.id,
      custoFichaTecnica: pizza.custo_ficha_tecnica,
      precoAtual: preco?.preco_atual ?? 0,
      cmvAlvo: cmvAlvoPct / 100,
      tetoPrecoMercado: pizza.teto_preco_mercado,
    });
  }, [pizza, preco, cmvAlvoPct]);

  // CMV% (custo ÷ preço) não desconta taxa de plataforma de propósito —
  // por isso o preço sugerido acima é igual em qualquer canal. Quem
  // realmente muda de canal pra canal é a margem de contribuição, que já
  // desconta comissão + taxa de transação + taxa de marketing do canal
  // selecionado.
  const margemContribuicaoAtual =
    pizza && preco && canal
      ? calcularMargemContribuicao(preco.preco_atual, pizza.custo_ficha_tecnica, canal)
      : null;
  const margemContribuicaoAtualPct =
    pizza && preco && canal
      ? calcularMargemContribuicaoPercentual(preco.preco_atual, pizza.custo_ficha_tecnica, canal)
      : null;
  const margemContribuicaoSugerida =
    pizza && resultado && canal
      ? calcularMargemContribuicao(resultado.precoSugeridoParaCMVAlvo, pizza.custo_ficha_tecnica, canal)
      : null;

  return (
    <div className="rounded-lg border border-creme-200 bg-white shadow-soft hover:shadow-card transition-shadow duration-200 p-5 space-y-4 h-fit">
      <h2 className="font-display text-lg font-semibold">Simulador de margem</h2>

      <div>
        <label className="text-xs text-tinta-400 block mb-1.5">Pizza</label>
        <select
          value={pizzaSelecionadaId}
          onChange={(e) => setPizzaSelecionadaId(e.target.value)}
          className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm"
        >
          {pizzas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-tinta-400 block mb-1.5">Canal</label>
        <select
          value={canalSelecionadoId}
          onChange={(e) => setCanalSelecionadoId(e.target.value)}
          className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm"
        >
          {canais.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-tinta-400 block mb-1.5">
          CMV-alvo: <span className="text-menta-600 font-mono">{cmvAlvoPct}%</span>
        </label>
        <input
          type="range"
          min={10}
          max={60}
          value={cmvAlvoPct}
          onChange={(e) => setCmvAlvoPct(Number(e.target.value))}
          className="w-full accent-menta-500"
        />
      </div>

      {resultado && (
        <div className="rounded-md bg-creme-50 p-4 space-y-2">
          <p className="text-sm text-tinta-400">
            CMV atual: <span className="text-tinta-950 font-mono">{formatarPercentual(resultado.cmvAtualPercentual)}</span>
          </p>
          <p className="text-sm text-tinta-400">
            Preço sugerido: <span className="text-menta-600 font-mono font-semibold">{formatarMoeda(resultado.precoSugeridoParaCMVAlvo)}</span>
          </p>
          <p className="text-[11px] text-tinta-400">
            Esse preço é o mesmo em qualquer canal — CMV não desconta taxa de plataforma. O que muda por canal é o que sobra de verdade, abaixo.
          </p>

          <div className="h-px bg-creme-200 my-1" />

          {margemContribuicaoAtual !== null && margemContribuicaoAtualPct !== null && (
            <p className="text-sm text-tinta-400">
              Margem de contribuição hoje em <strong className="text-tinta-700">{canal?.nome}</strong>:{" "}
              <span
                className={`font-mono font-semibold ${
                  margemContribuicaoAtual < 0 ? "text-sinal-vermelho" : "text-tinta-950"
                }`}
              >
                {formatarMoeda(margemContribuicaoAtual)} ({formatarPercentual(margemContribuicaoAtualPct)})
              </span>
            </p>
          )}
          {margemContribuicaoSugerida !== null && (
            <p className="text-sm text-tinta-400">
              Margem de contribuição no preço sugerido:{" "}
              <span className="font-mono font-semibold text-menta-600">{formatarMoeda(margemContribuicaoSugerida)}</span>
            </p>
          )}

          {resultado.ultrapassaTetoMercado && (
            <div className="mt-3 rounded-md border border-sinal-amarelo/40 bg-sinal-amarelo/10 p-3">
              <p className="text-sinal-amarelo text-xs font-semibold mb-1.5">
                Esse preço ultrapassa o teto de mercado que você definiu
              </p>
              <ul className="text-xs text-tinta-700 space-y-1 list-disc list-inside">
                {resultado.alavancasSugeridas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
