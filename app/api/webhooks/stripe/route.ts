import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { confirmarPagamento } from "@/lib/pagamentos";
import type Stripe from "stripe";

/**
 * Webhook único cuidando dos dois fluxos (compra + renovação), diferenciados
 * por metadata.tipo. PIX não confirma na hora — por isso escutamos tanto
 * `checkout.session.completed` (card, confirma na hora) quanto
 * `checkout.session.async_payment_succeeded` /
 * `checkout.session.async_payment_failed` (PIX, confirma depois).
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Assinatura do webhook inválida:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") break; // PIX pendente ainda não pago

      await confirmarPagamento(supabase, session);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tabela = session.metadata?.tipo === "renovacao" ? "renovacoes" : "purchases";
      await supabase
        .from(tabela)
        .update({ status: tabela === "purchases" ? "refunded" : "pending" })
        .eq("stripe_session_id", session.id);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const sessionId = charge.metadata?.session_id;
      if (sessionId) {
        await supabase
          .from("purchases")
          .update({ status: "refunded" })
          .eq("stripe_session_id", sessionId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
