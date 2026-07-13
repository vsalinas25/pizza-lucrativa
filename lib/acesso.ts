import { createClient } from "@/lib/supabase/server";

/**
 * Regra de negócio central do modelo híbrido:
 * - `purchases.status = 'completed'` → libera o CORE do produto. Vitalício.
 *   Isso NUNCA é revogado por falta de renovação.
 * - `renovacoes.status = 'completed' AND periodo_fim > now()` → libera
 *   APENAS: (1) atualização automática das taxas-padrão de plataforma via
 *   DEFAULT_TAXAS_PLATAFORMA, e (2) features marcadas `requer_renovacao`.
 *
 * Nunca usar `renovacaoAtiva` para decidir se o usuário acessa o dashboard.
 * Usar SOMENTE para decidir se ele vê o badge "taxas atualizadas" e se
 * features novas aparecem habilitadas ou em estado "disponível com
 * renovação" (nunca escondidas — sempre visíveis, com CTA claro).
 */
export async function getStatusAcesso(userId: string) {
  const supabase = createClient();

  const { data: compraAtiva } = await supabase.rpc("has_active_purchase", {
    uid: userId,
  });

  const { data: renovacaoAtiva } = await supabase.rpc("has_active_renovacao", {
    uid: userId,
  });

  return {
    temAcessoCore: Boolean(compraAtiva),
    temRenovacaoAtiva: Boolean(renovacaoAtiva),
  };
}
