import { createClient } from "@/lib/supabase/server";
import { getStatusAcesso } from "@/lib/acesso";
import BarraNavegacao from "@/components/dashboard/BarraNavegacao";
import SimuladorCenarios from "@/components/dashboard/SimuladorCenarios";

export default async function CenariosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware já protege, isto é só type-safety

  const { temRenovacaoAtiva } = await getStatusAcesso(user.id);

  const { data: pizzaria } = await supabase
    .from("pizzarias")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pizzaria) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <p className="text-tinta-400">
          Nenhuma pizzaria cadastrada ainda. Volte ao{" "}
          <a href="/onboarding" className="text-menta-600 underline">
            onboarding
          </a>
          .
        </p>
      </main>
    );
  }

  const { data: canais } = await supabase
    .from("canais_venda")
    .select("*")
    .eq("pizzaria_id", pizzaria.id);

  const { data: pizzas } = await supabase
    .from("pizzas")
    .select("*, precos_por_canal(*)")
    .eq("pizzaria_id", pizzaria.id);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 max-w-4xl mx-auto space-y-8">
      <BarraNavegacao
        pizzariaNome={pizzaria.nome}
        cidade={pizzaria.cidade}
        paginaAtiva="cenarios"
        renovacaoAtiva={temRenovacaoAtiva}
      />

      <SimuladorCenarios pizzaria={pizzaria} pizzas={pizzas ?? []} canais={canais ?? []} />
    </main>
  );
}
