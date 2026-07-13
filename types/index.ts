export type PurchaseStatus = "pending" | "completed" | "refunded";
export type RenovacaoStatus = "pending" | "completed";
export type Categoria = "tradicional" | "especial" | "doce";
export type NomeCanal = "site" | "ifood" | "keeta" | "99food" | "personalizado";

export interface Purchase {
  id: string;
  user_id: string;
  stripe_session_id: string;
  status: PurchaseStatus;
  tipo: "compra_unica";
  valor: number;
  metodo_pagamento: "card" | "pix" | null;
  purchased_at: string | null;
  created_at: string;
}

export interface Renovacao {
  id: string;
  user_id: string;
  stripe_session_id: string;
  status: RenovacaoStatus;
  valor: number;
  metodo_pagamento: "card" | "pix" | null;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  created_at: string;
}

export interface Pizzaria {
  id: string;
  user_id: string;
  nome: string;
  cidade: string | null;
  despesas_fixas_mensais: number;
  regime_tributario: string | null;
  aliquota_imposto: number;
  taxa_cartao: number;
  volume_mensal_pizzas: number;
  created_at: string;
}

export interface CanalVenda {
  id: string;
  pizzaria_id: string;
  nome: NomeCanal;
  comissao_percentual: number;
  taxa_transacao_percentual: number;
  taxa_marketing_percentual: number;
  custo_fixo_mensal: number;
  percentual_participacao_mix: number;
  atualizado_via_renovacao: boolean;
  created_at: string;
}

export interface Pizza {
  id: string;
  pizzaria_id: string;
  nome: string;
  categoria: Categoria;
  custo_ficha_tecnica: number;
  teto_preco_mercado: number | null;
  created_at: string;
}

export interface PrecoPorCanal {
  id: string;
  pizza_id: string;
  canal_id: string;
  preco_atual: number;
  created_at: string;
}

// Defaults de comissão de plataforma — atualizados manualmente hoje,
// e via painel admin + renovação no futuro. Nunca hardcode no componente,
// sempre puxe daqui para ter um único lugar de manutenção.
export const DEFAULT_TAXAS_PLATAFORMA: Record<NomeCanal, { comissao_percentual: number; label: string }> = {
  site: { comissao_percentual: 0, label: "Site próprio" },
  ifood: { comissao_percentual: 27, label: "iFood" },
  keeta: { comissao_percentual: 18, label: "Keeta" },
  "99food": { comissao_percentual: 12, label: "99Food" },
  personalizado: { comissao_percentual: 0, label: "Canal personalizado" },
};
// ⚠️ Estes números são placeholders de exemplo — validar taxa real vigente
// de cada plataforma antes de lançar. É exatamente o dado que a renovação
// anual (R$97) existe para manter atualizado.
