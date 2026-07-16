"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calcularCMVPercentual, classificarCMV, formatarPercentual, formatarMoeda } from "@/lib/calc";
import type { Pizza, CanalVenda, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

const CORES_ALERTA: Record<string, string> = {
  verde: "bg-sinal-verde/15 text-sinal-verde",
  amarelo: "bg-sinal-amarelo/15 text-sinal-amarelo",
  vermelho: "bg-sinal-vermelho/15 text-sinal-vermelho",
};

export default function TabelaPizzas({
  pizzas,
  canais,
}: {
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const [editando, setEditando] = useState<string | null>(null);

  async function atualizarPreco(pizzaId: string, canalId: string, novoPreco: number, precoId?: string) {
    const supabase = createClient();
    if (precoId) {
      await supabase.from("precos_por_canal").update({ preco_atual: novoPreco }).eq("id", precoId);
    } else {
      await supabase
        .from("precos_por_canal")
        .insert({ pizza_id: pizzaId, canal_id: canalId, preco_atual: novoPreco });
    }
    setEditando(null);
    // Um refresh real usaria router.refresh() — omitido aqui por simplicidade do preview
  }

  return (
    <div className="rounded-lg border border-creme-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-creme-200 text-left">
            <th className="px-4 py-3 text-tinta-400 font-medium">Pizza</th>
            <th className="px-4 py-3 text-tinta-400 font-medium">Custo</th>
            {canais.map((c) => (
              <th key={c.id} className="px-4 py-3 text-tinta-400 font-medium">
                {c.nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pizzas.map((pizza) => (
            <tr key={pizza.id} className="border-b border-white last:border-0">
              <td className="px-4 py-3 font-medium text-tinta-950">{pizza.nome}</td>
              <td className="px-4 py-3 text-tinta-400 tabular-nums font-mono">
                {formatarMoeda(pizza.custo_ficha_tecnica)}
              </td>
              {canais.map((canal) => {
                const preco = pizza.precos_por_canal.find((pc) => pc.canal_id === canal.id);
                const cmv = calcularCMVPercentual(pizza.custo_ficha_tecnica, preco?.preco_atual ?? 0);
                const nivel = classificarCMV(cmv);
                const key = `${pizza.id}-${canal.id}`;

                return (
                  <td key={canal.id} className="px-4 py-3">
                    {editando === key ? (
                      <input
                        autoFocus
                        type="number"
                        defaultValue={preco?.preco_atual ?? 0}
                        onBlur={(e) =>
                          atualizarPreco(pizza.id, canal.id, Number(e.target.value), preco?.id)
                        }
                        className="w-20 rounded bg-white border border-menta-600 px-2 py-1 text-tinta-950 font-mono"
                      />
                    ) : (
                      <button
                        onClick={() => setEditando(key)}
                        className={`rounded-md px-2.5 py-1 font-mono tabular-nums text-xs font-semibold ${CORES_ALERTA[nivel]}`}
                      >
                        {formatarMoeda(preco?.preco_atual ?? 0)} · {formatarPercentual(cmv)}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {pizzas.length === 0 && (
            <tr>
              <td colSpan={canais.length + 2} className="px-4 py-8 text-center text-tinta-400">
                Nenhuma pizza cadastrada ainda. Adicione no onboarding ou importe via CSV.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
