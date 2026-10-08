import { auth } from "@/auth";
import { buildOrderItems, validateAddress } from "@/lib/buildOrder";
import connectDb from "@/lib/db";
import { getDeliveryFee } from "@/lib/pricing";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const authSession = await auth();
    if (!authSession?.user?.id || authSession.user.role !== "user") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, address } = await req.json();

    // price aur total client se nahi, DB se calculate hote hain
    let orderItems, subTotal, cleanAddress;
    try {
      ({ orderItems, subTotal } = await buildOrderItems(items));
      cleanAddress = validateAddress(address);
    } catch (validationError: any) {
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      orderItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            // webhook me order banane ke liye
            metadata: {
              groceryId: String(item.grocery),
              unit: item.unit,
            },
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      }));

    // pehle delivery fee stripe me charge hi nahi ho rahi thi
    const deliveryFee = getDeliveryFee(subTotal);
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Delivery Fee" },
          unit_amount: deliveryFee * 100,
        },
        quantity: 1,
      });
    }

    // stripe metadata ki har value max 500 chars ki ho sakti hai,
    // isliye items yaha nahi rakhte aur address ke fields alag-alag rakhte hain
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,
      line_items: lineItems,
      metadata: {
        userId: authSession.user.id,
        fullName: cleanAddress.fullName.slice(0, 500),
        mobile: cleanAddress.mobile.slice(0, 500),
        city: cleanAddress.city.slice(0, 500),
        state: cleanAddress.state.slice(0, 500),
        pincode: cleanAddress.pincode.slice(0, 500),
        fullAddress: cleanAddress.fullAddress.slice(0, 500),
        latitude: String(cleanAddress.latitude),
        longitude: String(cleanAddress.longitude),
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
