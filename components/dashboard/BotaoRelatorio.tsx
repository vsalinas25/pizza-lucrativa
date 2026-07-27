"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { calcularDadosRelatorio } from "@/lib/relatorio";
import type { Pizza, CanalVenda, Pizzaria, PrecoPorCanal } from "@/types";

type PizzaComPrecos = Pizza & { precos_por_canal: PrecoPorCanal[] };

export default function BotaoRelatorio({
  pizzaria,
  pizzas,
  canais,
}: {
  pizzaria: Pizzaria;
  pizzas: PizzaComPrecos[];
  canais: CanalVenda[];
}) {
  const [gerando, setGerando] = useState(false);

  async function baixarRelatorio() {
    setGerando(true);
    try {
      // @react-pdf/renderer pesa ~500kB — carregado só quando o botão é
      // clicado, pra não inflar o bundle do dashboard em todo carregamento.
      const [{ pdf }, { default: RelatorioPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/dashboard/RelatorioPDF"),
      ]);

      // Recalcula do zero a cada clique — sempre reflete o estado atual
      // de preços, custos e taxas, nunca uma versão em cache.
      const dados = calcularDadosRelatorio(pizzaria, pizzas, canais);
      const agora = new Date();
      const geradoEm = agora.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const blob = await pdf(<RelatorioPDF dados={dados} geradoEm={geradoEm} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dataArquivo = agora.toISOString().slice(0, 10);
      link.href = url;
      link.download = `relatorio-${pizzaria.nome.toLowerCase().replace(/\s+/g, "-")}-${dataArquivo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      onClick={baixarRelatorio}
      disabled={gerando || pizzas.length === 0}
      className="flex items-center gap-1.5 rounded-full border border-creme-200 bg-white hover:border-menta-600 hover:text-menta-600 disabled:opacity-60 disabled:cursor-not-allowed text-tinta-700 px-3 py-1.5 text-sm font-medium transition-colors shadow-soft"
      title={pizzas.length === 0 ? "Cadastre pizzas pra gerar o relatório" : "Baixar relatório em PDF"}
    >
      <FileDown className="h-4 w-4" strokeWidth={2} />
      {gerando ? "Gerando..." : "Relatório em PDF"}
    </button>
  );
}
