import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { confirmarPagamento } from "@/lib/pagamentos";

/**
 * Vincula a purchase (criada como user_id=null antes da conta existir) ao
 * user_id recém-criado. Usa service role porque a purchase ainda não
 * pertence a este usuário do ponto de vista do RLS.
 *
 * Também confirma o pagamento aqui, sem esperar o webhook: o usuário só
 * chega nesta rota depois que /checkout/processando já confirmou via
 * polling direto na API do Stripe que payment_status === 'paid'. Sem isso,
 * o middleware poderia bloquear o acesso ao /onboarding logo após o
 * cadastro caso o webhook ainda não tivesse processado — exatamente a
 * fricção pós-compra que o produto exige eliminar. confirmarPagamento é
 * idempotente, então não há conflito se o webhook rodar em paralelo.
 */
export async function POST(request: Request) {
  const { sessionId, userId } = await request.json();
  if (!sessionId || !userId) {
    return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("purchases")
    .update({ user_id: userId })
    .eq("stripe_session_id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "paid") {
    await confirmarPagamento(supabase, session);
  }

  return NextResponse.json({ ok: true });
}
