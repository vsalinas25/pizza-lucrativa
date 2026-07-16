import { formatarMoeda } from "@/lib/calc";
import type { Purchase, Renovacao } from "@/types";
import BadgeRenovacao from "@/components/dashboard/BadgeRenovacao";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function StatusAcesso({
  compra,
  renovacao,
  renovacaoAtiva,
}: {
  compra: Purchase | null;
  renovacao: Renovacao | null;
  renovacaoAtiva: boolean;
}) {
  return (
    <div className="rounded-lg border border-creme-200 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-tinta-950 font-medium">Acesso vitalício ao dashboard</p>
          <p className="text-tinta-400 text-sm mt-0.5">
            {compra?.status === "completed"
              ? `Ativo desde ${formatarData(compra.purchased_at)} · ${formatarMoeda(compra.valor)} · ${
                  compra.metodo_pagamento === "pix" ? "PIX" : "cartão"
                }`
              : "Nenhuma compra confirmada — isto não deveria acontecer se você está vendo esta página."}
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sinal-verde/15 text-sinal-verde shrink-0">
          Vitalício
        </span>
      </div>

      <div className="h-px bg-creme-200" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-tinta-950 font-medium">Atualização de taxas de plataforma</p>
          <p className="text-tinta-400 text-sm mt-0.5">
            {renovacaoAtiva && renovacao
              ? `Ativa até ${formatarData(renovacao.periodo_fim)}. Seu dashboard e seus dados continuam funcionando normalmente mesmo depois de expirar.`
              : "Opcional — não bloqueia nada do que você já comprou. Atualiza as comissões-padrão de iFood, Keeta e 99Food e libera novidades."}
          </p>
        </div>
        <BadgeRenovacao renovacaoAtiva={renovacaoAtiva} />
      </div>

      <div className="h-px bg-creme-200" />

      <p className="text-tinta-400 text-xs">
        Recibo enviado por e-mail pelo Stripe no momento de cada pagamento. Em caso de dúvida sobre
        cobrança, entre em contato pelo suporte com o e-mail usado na compra.
      </p>
    </div>
  );
}
