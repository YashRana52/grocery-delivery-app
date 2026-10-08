import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const orders = await Order.find({})
      .populate("user assignedDeliveryBoy", "-password")
      .sort({ createdAt: -1 });
    return NextResponse.json(
      { orders },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "failed to get all orders" },
      {
        status: 500,
      },
    );
  }
}
