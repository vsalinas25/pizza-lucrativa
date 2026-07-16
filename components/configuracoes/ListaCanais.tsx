"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TAXAS_PLATAFORMA, type CanalVenda, type NomeCanal } from "@/types";

const TODOS_CANAIS: NomeCanal[] = ["site", "ifood", "keeta", "99food", "personalizado"];

export default function ListaCanais({
  pizzariaId,
  canaisIniciais,
}: {
  pizzariaId: string;
  canaisIniciais: CanalVenda[];
}) {
  const router = useRouter();
  const [canalParaAdicionar, setCanalParaAdicionar] = useState<NomeCanal>(
    TODOS_CANAIS.find((c) => !canaisIniciais.some((existente) => existente.nome === c)) ?? "personalizado"
  );
  const [adicionando, setAdicionando] = useState(false);

  async function salvarCampo(canalId: string, campo: keyof CanalVenda, valor: number) {
    const supabase = createClient();
    await supabase.from("canais_venda").update({ [campo]: valor }).eq("id", canalId);
    router.refresh();
  }

  async function removerCanal(canalId: string) {
    const supabase = createClient();
    await supabase.from("canais_venda").delete().eq("id", canalId);
    router.refresh();
  }

  async function adicionarCanal() {
    setAdicionando(true);
    const supabase = createClient();
    await supabase.from("canais_venda").insert({
      pizzaria_id: pizzariaId,
      nome: canalParaAdicionar,
      comissao_percentual: DEFAULT_TAXAS_PLATAFORMA[canalParaAdicionar].comissao_percentual,
      taxa_transacao_percentual: DEFAULT_TAXAS_PLATAFORMA[canalParaAdicionar].taxa_transacao_percentual,
      taxa_marketing_percentual: 0,
      custo_fixo_mensal: DEFAULT_TAXAS_PLATAFORMA[canalParaAdicionar].custo_fixo_mensal,
      percentual_participacao_mix: 0,
    });
    setAdicionando(false);
    router.refresh();
  }

  const canaisDisponiveisParaAdicionar = TODOS_CANAIS.filter(
    (c) => c === "personalizado" || !canaisIniciais.some((existente) => existente.nome === c)
  );

  return (
    <div className="space-y-4">
      {canaisIniciais.map((canal) => (
        <div key={canal.id} className="rounded-lg border border-creme-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-tinta-950">
              {DEFAULT_TAXAS_PLATAFORMA[canal.nome]?.label ?? canal.nome}
            </p>
            <button
              onClick={() => removerCanal(canal.id)}
              className="text-tinta-400 hover:text-sinal-vermelho transition-colors"
              aria-label="Remover canal"
              title="Remover canal"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoTaxa
              label="Comissão da plataforma (%)"
              valorInicial={canal.comissao_percentual}
              onSalvar={(v) => salvarCampo(canal.id, "comissao_percentual", v)}
            />
            <CampoTaxa
              label="Taxa de transação (%)"
              valorInicial={canal.taxa_transacao_percentual}
              onSalvar={(v) => salvarCampo(canal.id, "taxa_transacao_percentual", v)}
            />
            <CampoTaxa
              label="Taxa de marketing (%)"
              valorInicial={canal.taxa_marketing_percentual}
              onSalvar={(v) => salvarCampo(canal.id, "taxa_marketing_percentual", v)}
            />
            <CampoTaxa
              label="Custo fixo mensal (R$)"
              valorInicial={canal.custo_fixo_mensal}
              onSalvar={(v) => salvarCampo(canal.id, "custo_fixo_mensal", v)}
            />
            <CampoTaxa
              label="Participação no mix (%)"
              valorInicial={canal.percentual_participacao_mix}
              onSalvar={(v) => salvarCampo(canal.id, "percentual_participacao_mix", v)}
            />
          </div>
          {canal.atualizado_via_renovacao && (
            <p className="text-xs text-sinal-verde mt-3">Taxas atualizadas via renovação anual.</p>
          )}
        </div>
      ))}

      {canaisIniciais.length === 0 && (
        <p className="text-tinta-400 text-sm">Nenhum canal de venda cadastrado ainda.</p>
      )}

      {canaisDisponiveisParaAdicionar.length > 0 && (
        <div className="flex items-center gap-3">
          <select
            value={canalParaAdicionar}
            onChange={(e) => setCanalParaAdicionar(e.target.value as NomeCanal)}
            className="rounded-md bg-white border border-creme-200 px-3 py-2 text-sm"
          >
            {canaisDisponiveisParaAdicionar.map((c) => (
              <option key={c} value={c}>
                {DEFAULT_TAXAS_PLATAFORMA[c].label}
              </option>
            ))}
          </select>
          <button
            onClick={adicionarCanal}
            disabled={adicionando}
            className="rounded-md border border-creme-200 hover:border-menta-600 hover:text-menta-600 disabled:opacity-60 text-tinta-700 px-4 py-2 text-sm transition-colors"
          >
            {adicionando ? "Adicionando..." : "Adicionar canal"}
          </button>
        </div>
      )}
    </div>
  );
}

function CampoTaxa({
  label,
  valorInicial,
  onSalvar,
}: {
  label: string;
  valorInicial: number;
  onSalvar: (valor: number) => void;
}) {
  const [valor, setValor] = useState(String(valorInicial));

  return (
    <div>
      <label className="text-xs text-tinta-400 block mb-1.5">{label}</label>
      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={() => onSalvar(Number(valor) || 0)}
        className="w-full rounded-md bg-white border border-creme-200 px-3 py-2 text-sm text-tinta-950 outline-none focus:border-menta-600 font-mono"
      />
    </div>
  );
}
