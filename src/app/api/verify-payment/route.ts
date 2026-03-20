import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  const session = await stripe.checkout.sessions.retrieve(sessionId!);

  if (session.payment_status === "paid") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}
