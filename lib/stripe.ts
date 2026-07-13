import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PRECO_COMPRA_CENTAVOS = 29700; // R$297,00
export const PRECO_RENOVACAO_CENTAVOS = 9700; // R$97,00
