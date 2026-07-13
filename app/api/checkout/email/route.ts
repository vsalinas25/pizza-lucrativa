import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ email: null });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return NextResponse.json({ email: session.customer_details?.email ?? null });
}
