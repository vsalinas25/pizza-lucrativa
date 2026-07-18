"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import BadgeRenovacao from "@/components/dashboard/BadgeRenovacao";

export default function BarraNavegacao({
  pizzariaNome,
  cidade,
  paginaAtiva,
  renovacaoAtiva,
}: {
  pizzariaNome: string;
  cidade: string | null;
  paginaAtiva: "dashboard" | "configuracoes";
  renovacaoAtiva: boolean;
}) {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-tinta-950">{pizzariaNome}</h1>
        {cidade && <p className="text-tinta-400 text-sm">{cidade}</p>}
      </div>

      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 rounded-full border border-creme-200 bg-white p-1 shadow-soft">
          <a
            href="/dashboard"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              paginaAtiva === "dashboard"
                ? "bg-menta-500 text-white"
                : "text-tinta-700 hover:text-menta-600"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Dashboard</span>
          </a>
          <a
            href="/configuracoes"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              paginaAtiva === "configuracoes"
                ? "bg-menta-500 text-white"
                : "text-tinta-700 hover:text-menta-600"
            }`}
          >
            <Settings className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Configurações</span>
          </a>
        </nav>

        <BadgeRenovacao renovacaoAtiva={renovacaoAtiva} />

        <button
          onClick={sair}
          className="flex items-center gap-1.5 rounded-full border border-creme-200 bg-white px-3 py-1.5 text-sm text-tinta-400 hover:text-sinal-vermelho hover:border-sinal-vermelho/40 transition-colors shadow-soft"
          title="Sair da conta"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
