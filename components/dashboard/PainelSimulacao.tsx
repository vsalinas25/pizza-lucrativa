"use client";

import { useMemo, useState } from "react";
import { simularPrecoPizza, formatarMoeda, formatarPercentual } from "@/lib/calc";
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

  const pizza = pizzas.find((p) => p.id === pizzaSelecionadaId);
  const preco = pizza?.precos_por_canal.find((pc) => pc.canal_id === canalSelecionadoId);

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
        <div className="rounded-md bg-white p-4 space-y-2">
          <p className="text-sm text-tinta-400">
            CMV atual: <span className="text-tinta-950 font-mono">{formatarPercentual(resultado.cmvAtualPercentual)}</span>
          </p>
          <p className="text-sm text-tinta-400">
            Preço sugerido: <span className="text-menta-600 font-mono font-semibold">{formatarMoeda(resultado.precoSugeridoParaCMVAlvo)}</span>
          </p>

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
