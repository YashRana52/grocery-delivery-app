import { auth } from "@/auth";
import { buildOrderItems, validateAddress } from "@/lib/buildOrder";
import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id || session.user.role !== "user") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, address } = await req.json();

    // price aur total client se nahi, DB se calculate hote hain
    let orderItems, totalAmount, cleanAddress;
    try {
      ({ orderItems, totalAmount } = await buildOrderItems(items));
      cleanAddress = validateAddress(address);
    } catch (validationError: any) {
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    const newOrder = await Order.create({
      user: session.user.id,
      items: orderItems,
      paymentMethod: "cod",
      totalAmount,
      address: cleanAddress,
    });
    //socket io implement
    await emitEventHandler("new-order", newOrder);

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 },
    );
  }
}
