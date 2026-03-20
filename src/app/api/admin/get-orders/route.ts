import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const orders = await Order.find({})
      .populate("user assignedDeliveryBoy")
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
