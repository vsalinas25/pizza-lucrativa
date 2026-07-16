import { createClient } from "@/lib/supabase/server";
import { getStatusAcesso } from "@/lib/acesso";
import FormPizzaria from "@/components/configuracoes/FormPizzaria";
import ListaCanais from "@/components/configuracoes/ListaCanais";
import StatusAcesso from "@/components/configuracoes/StatusAcesso";

export default async function ConfiguracoesPage() {
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
    .eq("pizzaria_id", pizzaria.id)
    .order("created_at", { ascending: true });

  const { data: compra } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: renovacao } = await supabase
    .from("renovacoes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 max-w-3xl mx-auto space-y-10">
      <header>
        <h1 className="font-display text-2xl font-semibold">Configurações</h1>
        <p className="text-tinta-400 text-sm mt-1">
          Dados da pizzaria, canais de venda e status de acesso.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Sua pizzaria</h2>
        <FormPizzaria pizzaria={pizzaria} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Canais de venda</h2>
        <ListaCanais pizzariaId={pizzaria.id} canaisIniciais={canais ?? []} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Acesso e cobrança</h2>
        <StatusAcesso compra={compra ?? null} renovacao={renovacao ?? null} renovacaoAtiva={temRenovacaoAtiva} />
      </section>
    </main>
  );
}
