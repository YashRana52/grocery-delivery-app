import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.log("signature verification failed", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      await connectDb();

      // stripe same event dobara bhej sakta hai, duplicate order na bane
      const existing = await Order.findOne({ stripeSessionId: session.id });
      if (existing) {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100, expand: ["data.price.product"] },
      );

      const items = [];
      for (const li of lineItems.data) {
        const product = li.price?.product as Stripe.Product | undefined;
        const groceryId = product?.metadata?.groceryId;
        if (!product || !groceryId) continue; // delivery fee wala line item
        items.push({
          grocery: groceryId,
          name: product.name,
          price: String((li.price?.unit_amount ?? 0) / 100),
          unit: product.metadata.unit,
          image: product.images?.[0],
          quantity: li.quantity ?? 1,
        });
      }

      const meta = session.metadata || {};

      const order = await Order.create({
        user: meta.userId,
        items,
        address: {
          fullName: meta.fullName,
          mobile: meta.mobile,
          city: meta.city,
          state: meta.state,
          pincode: meta.pincode,
          fullAddress: meta.fullAddress,
          latitude: Number(meta.latitude),
          longitude: Number(meta.longitude),
        },
        totalAmount: (session.amount_total ?? 0) / 100,
        paymentMethod: "online",
        isPaid: true,
        stripeSessionId: session.id,
      });

      await emitEventHandler("new-order", order);
    } catch (error: any) {
      // duplicate key = parallel request ne order pehle hi bana diya
      if (error?.code !== 11000) {
        console.error("webhook order create error", error);
        return NextResponse.json(
          { message: "Order creation failed" },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json(
    {
      received: true,
    },
    {
      status: 200,
    },
  );
}
