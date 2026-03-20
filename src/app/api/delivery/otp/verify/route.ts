import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import emitEventHandler from "@/lib/emitEventHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { orderId, otp } = await req.json();

    if (!orderId || !otp) {
      return NextResponse.json(
        { message: "Order ID and OTP are required" },
        { status: 400 },
      );
    }

    //  Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    //  Already verified?
    if (order.deliveryOtpVerification) {
      return NextResponse.json(
        { message: "OTP already verified" },
        { status: 400 },
      );
    }

    //  Expiry check
    if (
      !order.otpExpires ||
      new Date(order.otpExpires).getTime() < Date.now()
    ) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    //  Compare hashed OTP
    const cleanOtp = otp.trim();

    const isMatch = await bcrypt.compare(cleanOtp, order.deliveryOtp);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    //  Update order
    order.status = "delivered";
    order.isPaid = true;
    order.deliveredAt = new Date();
    order.deliveryOtpVerification = true;

    //  clear OTP after use
    order.deliveryOtp = null;
    order.otpExpires = null;

    await order.save();

    //socket add status update
    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
    });

    //  Update assignment
    await DeliveryAssignment.findOneAndUpdate(
      { order: orderId },
      {
        $set: {
          assignedTo: null,
          status: "completed",
        },
      },
    );

    return NextResponse.json(
      { message: "Delivery completed successfully 🎉" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("OTP verify Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
