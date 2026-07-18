import { createClient } from "@/lib/supabase/server";
import { getStatusAcesso } from "@/lib/acesso";
import ResumoExecutivo from "@/components/dashboard/ResumoExecutivo";
import TabelaPizzas from "@/components/dashboard/TabelaPizzas";
import PainelSimulacao from "@/components/dashboard/PainelSimulacao";
import RankingOfensores from "@/components/dashboard/RankingOfensores";
import ComparativoCanais from "@/components/dashboard/ComparativoCanais";
import BarraNavegacao from "@/components/dashboard/BarraNavegacao";

export default async function DashboardPage() {
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
    <main className="min-h-screen px-5 py-8 sm:px-8 max-w-6xl mx-auto space-y-8">
      <BarraNavegacao
        pizzariaNome={pizzaria.nome}
        cidade={pizzaria.cidade}
        paginaAtiva="dashboard"
        renovacaoAtiva={temRenovacaoAtiva}
      />

      <ResumoExecutivo pizzaria={pizzaria} pizzas={pizzas ?? []} canais={canais ?? []} />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <TabelaPizzas pizzas={pizzas ?? []} canais={canais ?? []} pizzariaId={pizzaria.id} />
        <PainelSimulacao pizzas={pizzas ?? []} canais={canais ?? []} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RankingOfensores pizzas={pizzas ?? []} canais={canais ?? []} />
        <ComparativoCanais pizzas={pizzas ?? []} canais={canais ?? []} />
      </div>
    </main>
  );
}
