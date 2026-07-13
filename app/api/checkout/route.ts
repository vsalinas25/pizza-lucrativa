import { NextResponse } from "next/server";
import { stripe, PRECO_COMPRA_CENTAVOS } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Cria a sessão de checkout da compra inicial (R$297, pagamento único).
 * `mode: 'payment'` — nunca 'subscription'. Card + PIX habilitados.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "pix"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Precifique Sua Pizza — Acesso Vitalício",
            description:
              "Dashboard de CMV e precificação por canal + conteúdo educacional. Compra única, acesso permanente.",
          },
          unit_amount: PRECO_COMPRA_CENTAVOS,
        },
        quantity: 1,
      },
    ],
    // PIX no Brasil expira em minutos/horas — dar folga sem deixar sessão aberta indefinidamente
    payment_method_options: {
      pix: { expires_after_seconds: 3600 },
    },
    success_url: `${origin}/checkout/processando?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelado`,
    metadata: { tipo: "compra_unica" },
  });

  // Registra a sessão como 'pending' já aqui, para o webhook só precisar atualizar status
  const supabase = createServiceRoleClient();
  await supabase.from("purchases").insert({
    user_id: null, // preenchido depois da criação da conta, ver /checkout/processando
    stripe_session_id: session.id,
    status: "pending",
    tipo: "compra_unica",
    valor: PRECO_COMPRA_CENTAVOS / 100,
  });

  return NextResponse.json({ url: session.url });
}
