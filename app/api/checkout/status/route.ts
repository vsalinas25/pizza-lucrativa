import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id ausente" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  const paymentIntent = session.payment_intent;
  let pixQrCode: string | null = null;

  if (
    typeof paymentIntent === "object" &&
    paymentIntent?.next_action?.type === "pix_display_qr_code"
  ) {
    pixQrCode = paymentIntent.next_action.pix_display_qr_code?.image_url_png ?? null;
  }

  return NextResponse.json({
    payment_status: session.payment_status,
    pix_qr_code: pixQrCode,
  });
}
