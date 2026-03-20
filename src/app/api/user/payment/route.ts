import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { userId, items, paymentMethod, totalAmount, address } =
      await req.json();

    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !paymentMethod ||
      !totalAmount ||
      !address
    ) {
      return NextResponse.json(
        { message: "Please send all required fields" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // stripe session

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,

      line_items: items.map((item: any) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),

      metadata: {
        userId,
        items: JSON.stringify(items),
        totalAmount,
        address: JSON.stringify(address),
        paymentMethod,
      },
    });

    return NextResponse.json(
      {
        url: session.url,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Order payment error" },
      { status: 500 },
    );
  }
}
