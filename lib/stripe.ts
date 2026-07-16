import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PRECO_COMPRA_CENTAVOS = 29700; // R$297,00
export const PRECO_RENOVACAO_CENTAVOS = 9700; // R$97,00

/**
 * PIX exige verificação de conta Brasil habilitada no Stripe antes de
 * aparecer como payment_method_type disponível — enquanto isso não estiver
 * liberado, o Checkout falha com "payment method type provided: pix is
 * invalid". Setar STRIPE_PIX_HABILITADO=true assim que a conta Stripe
 * liberar PIX, sem precisar tocar em código.
 */
export function paymentMethodTypes(): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const pixHabilitado = process.env.STRIPE_PIX_HABILITADO === "true";
  return pixHabilitado ? ["card", "pix"] : ["card"];
}
