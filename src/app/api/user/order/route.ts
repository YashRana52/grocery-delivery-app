import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

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

    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      totalAmount,
      address,
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
