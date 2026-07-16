import { NextResponse } from "next/server";
import { stripe, PRECO_RENOVACAO_CENTAVOS, paymentMethodTypes } from "@/lib/stripe";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Cria a sessão de checkout da renovação anual (R$97, opcional).
 * Cobrada manualmente pelo usuário (botão no dashboard) ou via lembrete de
 * e-mail — NUNCA cobrança automática recorrente. mode: 'payment'.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;
  const metodos = paymentMethodTypes();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: metodos,
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Renovação Anual — Taxas Atualizadas + Novas Funcionalidades",
            description:
              "Atualização automática das taxas-padrão de plataforma (iFood, Keeta, 99Food) e acesso a novas funcionalidades por 12 meses. Seu dashboard e dados continuam funcionando normalmente mesmo sem esta renovação.",
          },
          unit_amount: PRECO_RENOVACAO_CENTAVOS,
        },
        quantity: 1,
      },
    ],
    payment_method_options: metodos.includes("pix")
      ? { pix: { expires_after_seconds: 3600 } }
      : undefined,
    success_url: `${origin}/dashboard?renovacao=sucesso`,
    cancel_url: `${origin}/dashboard?renovacao=cancelada`,
    metadata: { tipo: "renovacao", user_id: user.id },
  });

  // Mesmo racional do /api/checkout: se o insert falhar, a sessão vira uma
  // cobrança órfã sem jeito de vincular depois — expira e recusa em vez
  // disso.
  const svc = createServiceRoleClient();
  const { error } = await svc.from("renovacoes").insert({
    user_id: user.id,
    stripe_session_id: session.id,
    status: "pending",
    valor: PRECO_RENOVACAO_CENTAVOS / 100,
  });

  if (error) {
    console.error("Falha ao registrar renovação pendente:", error);
    await stripe.checkout.sessions.expire(session.id).catch(() => {});
    return NextResponse.json(
      { error: "Não foi possível iniciar a renovação. Tente novamente em alguns segundos." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
