"use client";

import { useEffect, useMemo, useState } from "react";
import { Target } from "lucide-react";
import { calcularMargemContribuicao, formatarMoeda } from "@/lib/calc";
import type { Pizza, CanalVenda, Pizzaria, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };
type TipoMeta = "faturamento" | "lucro" | "despesas";

export default function SimuladorMeta({
  pizzaria,
  pizzas,
  canais,
}: {
  pizzaria: Pizzaria;
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const [pizzaId, setPizzaId] = useState(pizzas[0]?.id ?? "");
  const [canalId, setCanalId] = useState(canais[0]?.id ?? "");
  const [tipoMeta, setTipoMeta] = useState<TipoMeta>("despesas");

  const mensalidadesCanais = canais.reduce((acc, c) => acc + c.custo_fixo_mensal, 0);
  const despesasFixasTotais = pizzaria.despesas_fixas_mensais + mensalidadesCanais;

  const [valorAlvo, setValorAlvo] = useState(String(despesasFixasTotais || ""));

  useEffect(() => {
    if (pizzas.length > 0 && !pizzas.some((p) => p.id === pizzaId)) setPizzaId(pizzas[0].id);
  }, [pizzas, pizzaId]);

  useEffect(() => {
    if (canais.length > 0 && !canais.some((c) => c.id === canalId)) setCanalId(canais[0].id);
  }, [canais, canalId]);

  // Ao trocar pra "cobrir despesas fixas", pré-preenche com o valor real —
  // o dono não precisa saber de cabeça quanto são as despesas fixas do mês.
  useEffect(() => {
    if (tipoMeta === "despesas") setValorAlvo(String(despesasFixasTotais || ""));
  }, [tipoMeta]); // eslint-disable-line react-hooks/exhaustive-deps

  const pizza = pizzas.find((p) => p.id === pizzaId);
  const canal = canais.find((c) => c.id === canalId);
  const preco = pizza?.precos_por_canal.find((pc) => pc.canal_id === canalId);
  const temPreco = !!preco && preco.preco_atual > 0;

  const resultado = useMemo(() => {
    if (!pizza || !canal || !temPreco || !preco) return null;
    const alvo = Number(valorAlvo) || 0;
    if (alvo <= 0) return null;

    const margem = calcularMargemContribuicao(preco.preco_atual, pizza.custo_ficha_tecnica, canal);
    const baseUnitaria = tipoMeta === "faturamento" ? preco.preco_atual : margem;

    if (baseUnitaria <= 0) {
      return { impossivel: true as const, margem };
    }

    const unidades = Math.ceil(alvo / baseUnitaria);
    return {
      impossivel: false as const,
      unidades,
      porDia: unidades / 30,
      faturamentoResultante: unidades * preco.preco_atual,
      margem,
    };
  }, [pizza, canal, preco, temPreco, tipoMeta, valorAlvo]);

  const OPCOES_META: { valor: TipoMeta; label: string }[] = [
    { valor: "despesas", label: "Cobrir despesas fixas" },
    { valor: "faturamento", label: "Atingir faturamento" },
    { valor: "lucro", label: "Atingir lucro" },
  ];

  return (
    <div className="rounded-lg border border-creme-200 bg-white shadow-soft hover:shadow-card transition-shadow duration-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-menta-600" />
        <h2 className="font-display text-lg font-semibold">Quanto preciso vender?</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-tinta-400 block mb-1.5">Pizza</label>
          <select
            value={pizzaId}
            onChange={(e) => setPizzaId(e.target.value)}
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
            value={canalId}
            onChange={(e) => setCanalId(e.target.value)}
            className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm"
          >
            {canais.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPCOES_META.map((o) => (
          <button
            key={o.valor}
            onClick={() => setTipoMeta(o.valor)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tipoMeta === o.valor
                ? "bg-menta-500 text-white"
                : "bg-creme-50 text-tinta-700 hover:bg-creme-100"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs text-tinta-400 block mb-1.5">
          {tipoMeta === "despesas" ? "Despesas fixas do mês (R$)" : "Valor alvo (R$)"}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={valorAlvo}
          onChange={(e) => setValorAlvo(e.target.value)}
          className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
        />
      </div>

      {!pizza || !canais.length ? (
        <p className="text-sm text-tinta-400">Cadastre uma pizza pra simular.</p>
      ) : !temPreco ? (
        <p className="text-sm text-tinta-400">
          Defina o preço de <strong className="text-tinta-700">{pizza.nome}</strong> em{" "}
          <strong className="text-tinta-700">{canal?.nome}</strong> pra simular.
        </p>
      ) : resultado?.impossivel ? (
        <div className="rounded-md border border-sinal-vermelho/40 bg-sinal-vermelho/10 p-3">
          <p className="text-sinal-vermelho text-xs font-semibold">
            Essa pizza dá prejuízo de {formatarMoeda(resultado.margem)} por unidade em {canal?.nome} — vender
            mais dela só afasta a meta. Ajuste o preço ou o custo primeiro.
          </p>
        </div>
      ) : resultado ? (
        <div className="rounded-md bg-creme-50 p-4 space-y-1">
          <p className="font-mono text-3xl font-semibold text-menta-600 tabular-nums">
            {resultado.unidades} {resultado.unidades === 1 ? "unidade" : "unidades"}
          </p>
          <p className="text-xs text-tinta-400">
            ≈ {resultado.porDia.toFixed(1)} por dia, todo dia do mês, só dessa pizza nesse canal
          </p>
          <p className="text-xs text-tinta-400 pt-2">
            Faturamento resultante: <span className="font-mono text-tinta-700">{formatarMoeda(resultado.faturamentoResultante)}</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-tinta-400">Informe um valor alvo maior que zero.</p>
      )}
    </div>
  );
}
