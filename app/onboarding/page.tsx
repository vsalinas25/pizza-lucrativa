"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TAXAS_PLATAFORMA, type NomeCanal } from "@/types";
import Papa from "papaparse";

const CANAIS_DISPONIVEIS: NomeCanal[] = ["site", "ifood", "keeta", "99food"];

export default function OnboardingPage() {
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [carregando, setCarregando] = useState(false);

  // Passo 1: dados da pizzaria
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [despesasFixas, setDespesasFixas] = useState("");
  const [regimeTributario, setRegimeTributario] = useState("");
  const [aliquota, setAliquota] = useState("");
  const [taxaCartao, setTaxaCartao] = useState("");
  const [volumeMensal, setVolumeMensal] = useState("");

  // Passo 2: canais ativos
  const [canaisAtivos, setCanaisAtivos] = useState<NomeCanal[]>(["site"]);

  // Passo 3: import CSV opcional
  const [csvPizzas, setCsvPizzas] = useState<{ nome: string; custo: number; preco: number }[]>([]);
  const [pizzariaId, setPizzariaId] = useState<string | null>(null);
  const [canalPadraoId, setCanalPadraoId] = useState<string | null>(null);
  const [canalPadraoNome, setCanalPadraoNome] = useState<string | null>(null);

  function alternarCanal(canal: NomeCanal) {
    setCanaisAtivos((atual) =>
      atual.includes(canal) ? atual.filter((c) => c !== canal) : [...atual, canal]
    );
  }

  async function salvarPizzariaECanais() {
    setCarregando(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: pizzaria, error } = await supabase
      .from("pizzarias")
      .insert({
        user_id: user.id,
        nome,
        cidade,
        despesas_fixas_mensais: Number(despesasFixas) || 0,
        regime_tributario: regimeTributario,
        aliquota_imposto: Number(aliquota) || 0,
        taxa_cartao: Number(taxaCartao) || 0,
        volume_mensal_pizzas: Number(volumeMensal) || 0,
      })
      .select()
      .single();

    if (error || !pizzaria) {
      setCarregando(false);
      alert("Não foi possível salvar. Tenta de novo.");
      return;
    }

    setPizzariaId(pizzaria.id);

    const canaisPayload = canaisAtivos.map((nomeCanal) => ({
      pizzaria_id: pizzaria.id,
      nome: nomeCanal,
      comissao_percentual: DEFAULT_TAXAS_PLATAFORMA[nomeCanal].comissao_percentual,
      taxa_transacao_percentual: DEFAULT_TAXAS_PLATAFORMA[nomeCanal].taxa_transacao_percentual,
      taxa_marketing_percentual: 0,
      custo_fixo_mensal: DEFAULT_TAXAS_PLATAFORMA[nomeCanal].custo_fixo_mensal,
      percentual_participacao_mix: Math.round(100 / canaisAtivos.length),
    }));

    const { data: canaisCriados } = await supabase
      .from("canais_venda")
      .insert(canaisPayload)
      .select();

    // Canal padrão pra associar os preços importados via CSV — o arquivo só
    // tem um preço por pizza, sem indicar canal, então usamos "site" se
    // ativo, senão o primeiro canal criado.
    const canalPadrao =
      canaisCriados?.find((c) => c.nome === "site") ?? canaisCriados?.[0] ?? null;
    setCanalPadraoId(canalPadrao?.id ?? null);
    setCanalPadraoNome(canalPadrao ? DEFAULT_TAXAS_PLATAFORMA[canalPadrao.nome as NomeCanal].label : null);

    setCarregando(false);
    setPasso(3);
  }

  function processarCSV(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (resultado) => {
        const linhas = resultado.data as Record<string, string>[];
        const pizzas = linhas
          .map((l) => ({
            nome: l.nome ?? l.pizza ?? "",
            custo: Number(l.custo ?? l.custo_ficha_tecnica ?? 0),
            preco: Number(l.preco ?? l.preco_atual ?? 0),
          }))
          .filter((p) => p.nome);
        setCsvPizzas(pizzas);
      },
    });
  }

  async function finalizarOnboarding() {
    setCarregando(true);
    const supabase = createClient();

    if (pizzariaId && csvPizzas.length > 0) {
      for (const p of csvPizzas) {
        const { data: pizza } = await supabase
          .from("pizzas")
          .insert({
            pizzaria_id: pizzariaId,
            nome: p.nome,
            categoria: "tradicional",
            custo_ficha_tecnica: p.custo,
          })
          .select()
          .single();

        // Sem isso, o preço da planilha era lido e depois descartado — a
        // pizza aparecia no dashboard com CMV 0% até o preço ser digitado
        // manualmente de novo.
        if (pizza && canalPadraoId && p.preco > 0) {
          await supabase.from("precos_por_canal").insert({
            pizza_id: pizza.id,
            canal_id: canalPadraoId,
            preco_atual: p.preco,
          });
        }
      }
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen px-5 py-10 max-w-lg mx-auto">
      <p className="font-mono text-xs uppercase tracking-widest text-menta-600 mb-2">
        Passo {passo} de 3
      </p>

      {passo === 1 && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-semibold mb-4">Conte sobre sua pizzaria</h1>
          <Campo label="Nome da pizzaria" value={nome} onChange={setNome} />
          <Campo label="Cidade" value={cidade} onChange={setCidade} />
          <Campo label="Despesas fixas mensais (R$)" value={despesasFixas} onChange={setDespesasFixas} type="number" />
          <Campo label="Regime tributário" value={regimeTributario} onChange={setRegimeTributario} />
          <Campo label="Alíquota de imposto (%)" value={aliquota} onChange={setAliquota} type="number" />
          <Campo label="Taxa de cartão (%)" value={taxaCartao} onChange={setTaxaCartao} type="number" />
          <Campo label="Volume mensal de pizzas" value={volumeMensal} onChange={setVolumeMensal} type="number" />
          <button
            onClick={() => setPasso(2)}
            disabled={!nome}
            className="w-full rounded-full bg-gradient-to-r from-menta-500 to-menta-600 hover:shadow-lift disabled:opacity-40 disabled:hover:shadow-none text-white font-semibold py-3 transition-all duration-200 active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      )}

      {passo === 2 && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-semibold mb-4">Onde você vende?</h1>
          <div className="space-y-2">
            {CANAIS_DISPONIVEIS.map((canal) => (
              <label
                key={canal}
                className="flex items-center gap-3 rounded-md border border-creme-200 bg-white px-4 py-3 cursor-pointer hover:border-menta-500 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={canaisAtivos.includes(canal)}
                  onChange={() => alternarCanal(canal)}
                  className="accent-menta-500"
                />
                <span>{DEFAULT_TAXAS_PLATAFORMA[canal].label}</span>
                <span className="ml-auto text-xs text-tinta-400">
                  comissão padrão {DEFAULT_TAXAS_PLATAFORMA[canal].comissao_percentual}%
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPasso(1)}
              className="rounded-full border border-creme-200 bg-white text-tinta-700 hover:border-menta-500 hover:text-menta-600 font-semibold px-5 py-3 text-sm transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={salvarPizzariaECanais}
              disabled={carregando || canaisAtivos.length === 0}
              className="flex-1 rounded-full bg-gradient-to-r from-menta-500 to-menta-600 hover:shadow-lift disabled:opacity-40 disabled:hover:shadow-none text-white font-semibold py-3 transition-all duration-200 active:scale-[0.98]"
            >
              {carregando ? "Salvando..." : "Continuar"}
            </button>
          </div>
        </div>
      )}

      {passo === 3 && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-semibold mb-2">Importar pizzas (opcional)</h1>
          <p className="text-tinta-400 text-sm mb-4">
            CSV com colunas: nome, custo, preco. Pode pular e cadastrar direto no dashboard.
            {canalPadraoNome && (
              <>
                {" "}
                O preço da planilha é gravado no canal <strong className="text-tinta-700">{canalPadraoNome}</strong> —
                dá pra ajustar por canal depois, direto na tabela do dashboard.
              </>
            )}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && processarCSV(e.target.files[0])}
            className="text-sm text-tinta-700"
          />
          {csvPizzas.length > 0 && (
            <p className="text-sinal-verde text-sm">{csvPizzas.length} pizzas encontradas no arquivo.</p>
          )}
          <button
            onClick={finalizarOnboarding}
            disabled={carregando}
            className="w-full rounded-full bg-gradient-to-r from-menta-500 to-menta-600 hover:shadow-lift disabled:opacity-40 disabled:hover:shadow-none text-white font-semibold py-3 transition-all duration-200 active:scale-[0.98]"
          >
            {carregando ? "Finalizando..." : "Ir para o dashboard"}
          </button>
        </div>
      )}
    </main>
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
