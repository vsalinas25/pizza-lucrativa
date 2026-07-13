import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Vincula a purchase (criada como user_id=null antes da conta existir) ao
 * user_id recém-criado. Usa service role porque a purchase ainda não
 * pertence a este usuário do ponto de vista do RLS.
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
  return NextResponse.json({ ok: true });
}
