"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calcularCMVPercentual, classificarCMV, formatarPercentual, formatarMoeda } from "@/lib/calc";
import type { Pizza, CanalVenda, PrecoPorCanal, Categoria } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

const CORES_ALERTA: Record<string, string> = {
  verde: "bg-sinal-verde/15 text-sinal-verde",
  amarelo: "bg-sinal-amarelo/15 text-sinal-amarelo",
  vermelho: "bg-sinal-vermelho/15 text-sinal-vermelho",
};

export default function TabelaPizzas({
  pizzas,
  canais,
  pizzariaId,
}: {
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
  pizzariaId: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState<string | null>(null);
  const [editandoPizzaId, setEditandoPizzaId] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [salvandoNova, setSalvandoNova] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoCusto, setNovoCusto] = useState("");
  const [novoTeto, setNovoTeto] = useState("");

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
    router.refresh();
  }

  async function atualizarPizza(
    pizzaId: string,
    dados: { nome: string; custo_ficha_tecnica: number; teto_preco_mercado: number | null }
  ) {
    const supabase = createClient();
    await supabase.from("pizzas").update(dados).eq("id", pizzaId);
    setEditandoPizzaId(null);
    router.refresh();
  }

  async function excluirPizza(pizzaId: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Isso remove também os preços cadastrados dela em todos os canais.`)) {
      return;
    }
    const supabase = createClient();
    await supabase.from("pizzas").delete().eq("id", pizzaId);
    router.refresh();
  }

  async function adicionarPizza(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome || !novoCusto) return;
    setSalvandoNova(true);
    const supabase = createClient();
    const { error } = await supabase.from("pizzas").insert({
      pizzaria_id: pizzariaId,
      nome: novoNome,
      categoria: "tradicional" as Categoria,
      custo_ficha_tecnica: Number(novoCusto),
      teto_preco_mercado: novoTeto ? Number(novoTeto) : null,
    });
    setSalvandoNova(false);
    if (!error) {
      setNovoNome("");
      setNovoCusto("");
      setNovoTeto("");
      setAdicionando(false);
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg border border-creme-200 bg-white shadow-soft hover:shadow-card transition-shadow duration-200">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="font-display text-lg font-semibold text-tinta-950">Suas pizzas</h2>
        <button
          onClick={() => setAdicionando((a) => !a)}
          className="flex items-center gap-1.5 rounded-full bg-menta-500 hover:bg-menta-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
        >
          {adicionando ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {adicionando ? "Cancelar" : "Adicionar pizza"}
        </button>
      </div>

      {adicionando && (
        <form onSubmit={adicionarPizza} className="mx-4 mt-3 mb-1 rounded-md bg-creme-50 border border-creme-200 p-4 grid gap-3 sm:grid-cols-3 animate-fade-up">
          <div className="sm:col-span-1">
            <label className="text-xs text-tinta-400 block mb-1">Nome da pizza</label>
            <input
              autoFocus
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm outline-none focus:border-menta-600"
              placeholder="Ex: Margherita"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1">Custo da ficha técnica (R$)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={novoCusto}
              onChange={(e) => setNovoCusto(e.target.value)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1">Teto de preço de mercado (opcional)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={novoTeto}
              onChange={(e) => setNovoTeto(e.target.value)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={salvandoNova}
              className="rounded-md bg-menta-500 hover:bg-menta-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              {salvandoNova ? "Salvando..." : "Salvar pizza"}
            </button>
          </div>
          <p className="sm:col-span-3 text-xs text-tinta-400">
            Depois de salvar, clique nos preços da linha dessa pizza na tabela abaixo pra definir o preço em cada canal.
          </p>
        </form>
      )}

      <div className="overflow-x-auto mt-3">
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
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {pizzas.map((pizza) =>
              editandoPizzaId === pizza.id ? (
                <FormEdicaoPizza
                  key={pizza.id}
                  pizza={pizza}
                  colSpan={canais.length + 3}
                  onSalvar={(dados) => atualizarPizza(pizza.id, dados)}
                  onCancelar={() => setEditandoPizzaId(null)}
                />
              ) : (
                <tr key={pizza.id} className="border-b border-creme-100 last:border-0 group hover:bg-creme-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-tinta-950">{pizza.nome}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditandoPizzaId(pizza.id)}
                      className="text-tinta-700 tabular-nums font-mono hover:text-menta-600 transition-colors underline decoration-dotted decoration-tinta-400 underline-offset-2"
                      title="Clique para editar custo e teto de mercado"
                    >
                      {formatarMoeda(pizza.custo_ficha_tecnica)}
                    </button>
                  </td>
                  {canais.map((canal) => {
                    const preco = pizza.precos_por_canal.find((pc) => pc.canal_id === canal.id);
                    const temPreco = !!preco && preco.preco_atual > 0;
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
                        ) : temPreco ? (
                          <button
                            onClick={() => setEditando(key)}
                            className={`rounded-md px-2.5 py-1 font-mono tabular-nums text-xs font-semibold hover:opacity-80 transition-opacity ${CORES_ALERTA[nivel]}`}
                          >
                            {formatarMoeda(preco.preco_atual)} · {formatarPercentual(cmv)}
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditando(key)}
                            className="rounded-md px-2.5 py-1 font-mono text-xs font-medium text-tinta-400 bg-creme-100 hover:bg-creme-200 transition-colors"
                          >
                            Definir preço
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditandoPizzaId(pizza.id)}
                        className="text-tinta-400 hover:text-menta-600"
                        aria-label={`Editar ${pizza.nome}`}
                        title="Editar nome, custo e teto de mercado"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => excluirPizza(pizza.id, pizza.nome)}
                        className="text-tinta-400 hover:text-sinal-vermelho"
                        aria-label={`Excluir ${pizza.nome}`}
                        title="Excluir pizza"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {pizzas.length === 0 && (
              <tr>
                <td colSpan={canais.length + 3} className="px-4 py-10 text-center text-tinta-400">
                  Nenhuma pizza cadastrada ainda. Clique em &ldquo;Adicionar pizza&rdquo; acima pra começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormEdicaoPizza({
  pizza,
  colSpan,
  onSalvar,
  onCancelar,
}: {
  pizza: PizzaComPrecos;
  colSpan: number;
  onSalvar: (dados: { nome: string; custo_ficha_tecnica: number; teto_preco_mercado: number | null }) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState(pizza.nome);
  const [custo, setCusto] = useState(String(pizza.custo_ficha_tecnica));
  const [teto, setTeto] = useState(pizza.teto_preco_mercado ? String(pizza.teto_preco_mercado) : "");

  return (
    <tr className="border-b border-creme-100 last:border-0 bg-creme-50">
      <td colSpan={colSpan} className="px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-4 items-end">
          <div>
            <label className="text-xs text-tinta-400 block mb-1">Nome</label>
            <input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm outline-none focus:border-menta-600"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1">Custo da ficha técnica (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
          <div>
            <label className="text-xs text-tinta-400 block mb-1">Teto de preço de mercado</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={teto}
              onChange={(e) => setTeto(e.target.value)}
              placeholder="opcional"
              className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm font-mono outline-none focus:border-menta-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                onSalvar({
                  nome,
                  custo_ficha_tecnica: Number(custo) || 0,
                  teto_preco_mercado: teto ? Number(teto) : null,
                })
              }
              className="rounded-md bg-menta-500 hover:bg-menta-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={onCancelar}
              className="rounded-md border border-creme-200 text-tinta-700 text-sm px-3 py-2 hover:bg-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
