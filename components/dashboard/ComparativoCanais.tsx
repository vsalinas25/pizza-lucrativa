"use client";

import { useEffect, useState } from "react";
import { calcularCMVPercentual, calcularMargemContribuicao, formatarPercentual, formatarMoeda } from "@/lib/calc";
import type { Pizza, CanalVenda, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

export default function ComparativoCanais({
  pizzas,
  canais,
}: {
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const [pizzaId, setPizzaId] = useState(pizzas[0]?.id ?? "");

  // Se a pizza selecionada foi excluída, ou se a lista passou de vazia pra
  // populada depois que este componente já montou (ex: primeira pizza
  // criada), useState não re-sincroniza sozinho — sem isso o comparativo
  // fica em branco até um reload manual da página.
  useEffect(() => {
    if (pizzas.length > 0 && !pizzas.some((p) => p.id === pizzaId)) {
      setPizzaId(pizzas[0].id);
    }
  }, [pizzas, pizzaId]);

  const pizza = pizzas.find((p) => p.id === pizzaId);

  return (
    <div className="rounded-lg border border-creme-200 bg-white shadow-soft hover:shadow-card transition-shadow duration-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Comparativo entre canais</h2>
        <select
          value={pizzaId}
          onChange={(e) => setPizzaId(e.target.value)}
          className="rounded-md bg-white border border-creme-200 px-2.5 py-1.5 text-xs"
        >
          {pizzas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {pizza && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {canais.map((canal) => {
            const preco = pizza.precos_por_canal.find((pc) => pc.canal_id === canal.id);
            const temPreco = !!preco && preco.preco_atual > 0;
            const cmv = calcularCMVPercentual(pizza.custo_ficha_tecnica, preco?.preco_atual ?? 0);
            const margemContribuicao = temPreco
              ? calcularMargemContribuicao(preco.preco_atual, pizza.custo_ficha_tecnica, canal)
              : null;
            return (
              <div key={canal.id} className="rounded-md bg-creme-50 p-3">
                <p className="text-xs text-tinta-400 mb-1">{canal.nome}</p>
                {temPreco ? (
                  <>
                    <p className="font-mono text-sm font-semibold text-tinta-950">
                      {formatarMoeda(preco.preco_atual)}
                    </p>
                    <p className="font-mono text-xs text-menta-600">{formatarPercentual(cmv)} CMV</p>
                    <p
                      className={`font-mono text-xs mt-1 ${
                        margemContribuicao !== null && margemContribuicao < 0
                          ? "text-sinal-vermelho"
                          : "text-tinta-400"
                      }`}
                    >
                      {formatarMoeda(margemContribuicao ?? 0)} sobra
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-xs text-tinta-400">Sem preço definido</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
