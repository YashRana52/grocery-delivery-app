import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.log("signature verification failed", error);
  }

  if (event?.type === "checkout.session.completed") {
    const session = event.data.object;

    await connectDb();

    const userId = session.metadata?.userId;
    const items = JSON.parse(session.metadata?.items || "[]");
    const address = JSON.parse(session.metadata?.address || "{}");

    await Order.create({
      user: userId,
      items,
      address,
      totalAmount: session.metadata?.totalAmount,
      paymentMethod: session.metadata?.paymentMethod,
      isPaid: true,
    });
  }
  return NextResponse.json(
    {
      recieved: true,
    },
    {
      status: 200,
    },
  );
}
