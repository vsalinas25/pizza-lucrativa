import { calcularCMVPercentual, calcularMargemContribuicao, formatarPercentual, formatarMoeda } from "@/lib/calc";
import type { Pizza, CanalVenda, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

export default function RankingOfensores({
  pizzas,
  canais,
}: {
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const ofensores = pizzas
    .flatMap((pizza) =>
      pizza.precos_por_canal
        .filter((pc) => pc.preco_atual > 0) // preço não definido não é "ofensor", é dado ausente
        .map((pc) => {
          const canal = canais.find((c) => c.id === pc.canal_id);
          return {
            pizzaNome: pizza.nome,
            canalNome: canal?.nome ?? "—",
            cmv: calcularCMVPercentual(pizza.custo_ficha_tecnica, pc.preco_atual),
            margem: canal ? calcularMargemContribuicao(pc.preco_atual, pizza.custo_ficha_tecnica, canal) : null,
          };
        })
    )
    .sort((a, b) => b.cmv - a.cmv)
    .slice(0, 6);

  function acaoSugerida(cmv: number): string {
    if (cmv > 0.45) return "Renegociar custo ou subir preço com urgência";
    if (cmv > 0.38) return "Revisar ficha técnica ou ajustar preço";
    return "Monitorar";
  }

  return (
    <div className="rounded-lg border border-creme-200 bg-white shadow-soft hover:shadow-card transition-shadow duration-200 p-5">
      <h2 className="font-display text-lg font-semibold mb-4">Piores ofensores</h2>
      <div className="space-y-3">
        {ofensores.map((o, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tinta-950">{o.pizzaNome}</p>
              <p className="text-xs text-tinta-400">
                {o.canalNome} · {acaoSugerida(o.cmv)}
              </p>
            </div>
            <div className="text-right">
              <span className="block font-mono text-sm font-semibold text-sinal-vermelho tabular-nums">
                {formatarPercentual(o.cmv)}
              </span>
              {o.margem !== null && (
                <span
                  className={`block font-mono text-xs tabular-nums ${
                    o.margem < 0 ? "text-sinal-vermelho" : "text-tinta-400"
                  }`}
                >
                  {o.margem >= 0 ? "+" : ""}
                  {formatarMoeda(o.margem)}
                </span>
              )}
            </div>
          </div>
        ))}
        {ofensores.length === 0 && (
          <p className="text-tinta-400 text-sm">Sem dados suficientes ainda.</p>
        )}
      </div>
    </div>
  );
}
