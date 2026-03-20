import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectDb();

    const { orderId } = await params;

    console.log("orderId", orderId);

    if (!orderId) {
      return NextResponse.json(
        { message: "Invalid order id" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId).populate("assignedDeliveryBoy");

    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.log("ERROR:", error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
