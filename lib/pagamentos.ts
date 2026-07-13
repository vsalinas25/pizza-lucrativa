import { stripe } from "@/lib/stripe";
import type { createServiceRoleClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

/**
 * Confirma o pagamento de uma sessão Stripe já paga (`payment_status ===
 * 'paid'`), gravando o resultado em `purchases` ou `renovacoes` conforme
 * `metadata.tipo`. Idempotente — pode ser chamada tanto pelo webhook quanto
 * pela rota de vinculação de conta (que confirma via polling direto na API
 * do Stripe, sem esperar o webhook, para não travar o pós-compra).
 */
export async function confirmarPagamento(
  supabase: ReturnType<typeof createServiceRoleClient>,
  session: Stripe.Checkout.Session
) {
  const metodo = await detectarMetodoPagamento(session);
  const tipo = session.metadata?.tipo;

  if (tipo === "renovacao") {
    const inicio = new Date();
    const fim = new Date(inicio);
    fim.setFullYear(fim.getFullYear() + 1);

    await supabase
      .from("renovacoes")
      .update({
        status: "completed",
        metodo_pagamento: metodo,
        periodo_inicio: inicio.toISOString(),
        periodo_fim: fim.toISOString(),
      })
      .eq("stripe_session_id", session.id);
    return;
  }

  // compra_unica
  await supabase
    .from("purchases")
    .update({
      status: "completed",
      metodo_pagamento: metodo,
      checkout_email: session.customer_details?.email ?? null,
      purchased_at: new Date().toISOString(),
    })
    .eq("stripe_session_id", session.id);
}

/**
 * `session.payment_method_types` lista TODOS os métodos oferecidos no
 * checkout (sempre ['card', 'pix'] aqui), não o que o cliente de fato usou.
 * Para saber o método real, é preciso olhar o payment_method do
 * payment_intent associado.
 */
export async function detectarMetodoPagamento(
  session: Stripe.Checkout.Session
): Promise<"card" | "pix"> {
  if (typeof session.payment_intent !== "string") return "card";

  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
    expand: ["payment_method"],
  });

  const paymentMethod = paymentIntent.payment_method;
  if (typeof paymentMethod === "object" && paymentMethod?.type === "pix") {
    return "pix";
  }
  return "card";
}
