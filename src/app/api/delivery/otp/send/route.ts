import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 },
      );
    }

    //  Fetch Order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // sirf assigned delivery boy hi OTP bhej sakta hai
    if (String(order.assignedDeliveryBoy) !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (order.status === "delivered") {
      return NextResponse.json(
        { message: "Order already delivered" },
        { status: 400 },
      );
    }

    //  Fetch User
    const user = await User.findById(order.user);

    if (!user || !user.email) {
      return NextResponse.json(
        { message: "User email not found" },
        { status: 400 },
      );
    }

    //  Generate OTP (crypto se, Math.random predictable hota hai)
    const otp = randomInt(1000, 10000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    //  SAVE OTP
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        deliveryOtp: hashedOtp,
        otpExpires: otpExpiry,
        deliveryOtpVerification: false,
        otpAttempts: 0,
      },
    });

    // Email Template
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
      <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; padding:30px;">

        <h2 style="text-align:center;">🚚 Delivery Verification</h2>

        <p>Hello <strong>${user.name || "Customer"}</strong>,</p>

        <p>Your order is out for delivery. Use this OTP:</p>

        <div style="text-align:center; margin:20px 0;">
          <span style="font-size:28px; font-weight:bold;">
            ${otp}
          </span>
        </div>

        <p>This OTP expires in 10 minutes.</p>
      </div>
    </div>
    `;

    //  Send Email
    try {
      await sendMail(user.email, "Your Delivery OTP", htmlTemplate);
    } catch (mailError) {
      console.log(" Email Failed:", mailError);
      return NextResponse.json(
        { message: "Failed to send OTP email" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(" OTP API ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
