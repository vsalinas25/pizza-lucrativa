"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Pizzaria } from "@/types";

export default function FormPizzaria({ pizzaria }: { pizzaria: Pizzaria }) {
  const router = useRouter();
  const [nome, setNome] = useState(pizzaria.nome);
  const [cidade, setCidade] = useState(pizzaria.cidade ?? "");
  const [despesasFixas, setDespesasFixas] = useState(String(pizzaria.despesas_fixas_mensais));
  const [regimeTributario, setRegimeTributario] = useState(pizzaria.regime_tributario ?? "");
  const [aliquota, setAliquota] = useState(String(pizzaria.aliquota_imposto));
  const [taxaCartao, setTaxaCartao] = useState(String(pizzaria.taxa_cartao));
  const [volumeMensal, setVolumeMensal] = useState(String(pizzaria.volume_mensal_pizzas));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("pizzarias")
      .update({
        nome,
        cidade,
        despesas_fixas_mensais: Number(despesasFixas) || 0,
        regime_tributario: regimeTributario,
        aliquota_imposto: Number(aliquota) || 0,
        taxa_cartao: Number(taxaCartao) || 0,
        volume_mensal_pizzas: Number(volumeMensal) || 0,
      })
      .eq("id", pizzaria.id);

    setSalvando(false);
    if (!error) {
      setSalvo(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={salvar} className="rounded-lg border border-creme-200 p-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nome da pizzaria" value={nome} onChange={setNome} />
        <Campo label="Cidade" value={cidade} onChange={setCidade} />
        <Campo label="Despesas fixas mensais (R$)" value={despesasFixas} onChange={setDespesasFixas} type="number" />
        <Campo label="Regime tributário" value={regimeTributario} onChange={setRegimeTributario} />
        <Campo label="Alíquota de imposto (%)" value={aliquota} onChange={setAliquota} type="number" />
        <Campo label="Taxa de cartão (%)" value={taxaCartao} onChange={setTaxaCartao} type="number" />
        <Campo label="Volume mensal de pizzas" value={volumeMensal} onChange={setVolumeMensal} type="number" />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-md bg-menta-500 hover:bg-menta-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        {salvo && <span className="text-sinal-verde text-sm">Salvo.</span>}
      </div>
    </form>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-tinta-700 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-white border border-creme-200 px-3.5 py-2.5 text-tinta-950 outline-none focus:border-menta-600"
      />
    </div>
  );
}
