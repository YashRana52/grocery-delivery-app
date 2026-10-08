import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status === "paid" &&
      session.metadata?.userId === authSession.user.id
    ) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.log("verify payment error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
