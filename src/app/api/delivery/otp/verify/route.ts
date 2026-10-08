import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import emitEventHandler from "@/lib/emitEventHandler";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    if (String(order.assignedDeliveryBoy) !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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
      !order.deliveryOtp ||
      !order.otpExpires ||
      new Date(order.otpExpires).getTime() < Date.now()
    ) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // 4 digit OTP brute force na ho
    if ((order.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        { message: "Too many wrong attempts, please resend OTP" },
        { status: 429 },
      );
    }

    //  Compare hashed OTP
    const cleanOtp = String(otp).trim();

    const isMatch = await bcrypt.compare(cleanOtp, order.deliveryOtp);

    if (!isMatch) {
      await Order.updateOne({ _id: order._id }, { $inc: { otpAttempts: 1 } });
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
    order.otpAttempts = 0;

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
