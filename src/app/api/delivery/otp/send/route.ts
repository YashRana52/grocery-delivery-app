import connectDb from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

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

    //  Fetch User
    const user = await User.findById(order.user);

    if (!user || !user.email) {
      console.log("❌ Email missing");
      return NextResponse.json(
        { message: "User email not found" },
        { status: 400 },
      );
    }

    //  Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    //  SAVE OTP
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          deliveryOtp: hashedOtp,
          otpExpires: otpExpiry,
          deliveryOtpVerification: false,
        },
      },
      { returnDocument: "after" },
    );

    console.log(" OTP SAVED IN DB:", {
      otp: updatedOrder?.deliveryOtp,
      expiry: updatedOrder?.otpExpires,
    });

    setTimeout(async () => {
      const check = await Order.findById(orderId);
      console.log(" AFTER 2 SEC CHECK:", {
        otp: check?.deliveryOtp,
        expiry: check?.otpExpires,
      });
    }, 2000);

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
