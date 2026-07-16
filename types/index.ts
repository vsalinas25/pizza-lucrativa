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

// Defaults de comissão de plataforma — levantados em 2026-07-13 a partir das
// tabelas públicas de taxas de iFood, Keeta e 99Food. Atualizados
// manualmente hoje, e via painel admin + renovação no futuro. Nunca
// hardcode nos componentes, sempre puxe daqui para ter um único lugar de
// manutenção.
//
// Cada plataforma tem mais de um plano comercial — o default aqui é o
// plano "entrega própria do restaurante" (o mais comum e mais barato),
// não o plano de logística completa da plataforma. Quem usa a frota da
// própria plataforma (iFood Full, etc.) deve ajustar em /configuracoes:
//   iFood Full (entrega pelo app): comissão 23–27%, mensalidade R$150/mês
//   Keeta: comissão 9,9–16% (9,9% é taxa promocional de 1 ano)
//   99Food Flex: comissão 8,9–12% + ~4,5–11% se usar entregador da 99;
//     99Food Plano Fixo: 0% de comissão, mas obriga preço igual ao balcão
export const DEFAULT_TAXAS_PLATAFORMA: Record<
  NomeCanal,
  {
    comissao_percentual: number;
    taxa_transacao_percentual: number;
    custo_fixo_mensal: number;
    label: string;
  }
> = {
  site: { comissao_percentual: 0, taxa_transacao_percentual: 0, custo_fixo_mensal: 0, label: "Site próprio" },
  ifood: {
    comissao_percentual: 12, // plano básico, entrega própria
    taxa_transacao_percentual: 3.2, // taxa de pagamento online
    custo_fixo_mensal: 110, // isenta se faturar < R$1.800/mês
    label: "iFood",
  },
  keeta: {
    comissao_percentual: 12, // meio da faixa 9,9%–16% fora de período promocional
    taxa_transacao_percentual: 1,
    custo_fixo_mensal: 0, // sem mensalidade fixa
    label: "Keeta",
  },
  "99food": {
    comissao_percentual: 8.9, // plano Flex
    taxa_transacao_percentual: 3.2,
    custo_fixo_mensal: 0, // sem mensalidade fixa
    label: "99Food",
  },
  personalizado: { comissao_percentual: 0, taxa_transacao_percentual: 0, custo_fixo_mensal: 0, label: "Canal personalizado" },
};
