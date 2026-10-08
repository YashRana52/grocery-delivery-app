import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { canAccessOrder } from "@/lib/orderAccess";
import Order from "@/models/order.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "Invalid order id" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId).populate(
      "assignedDeliveryBoy",
      "-password",
    );

    if (!order || !canAccessOrder(session, order)) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.log("ERROR:", error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
