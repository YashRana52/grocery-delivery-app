import connectDb from "@/lib/db";

import Message from "@/models/message.model";
import Order from "@/models/order.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// ye route socket server call karta hai
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { roomId, text, senderId, time } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(roomId) ||
      !mongoose.Types.ObjectId.isValid(senderId)
    ) {
      return NextResponse.json({ message: "invalid message" }, { status: 400 });
    }

    const cleanText = String(text || "").trim();
    if (!cleanText || cleanText.length > 1000) {
      return NextResponse.json({ message: "invalid message" }, { status: 400 });
    }

    const room = await Order.findById(roomId);
    if (!room) {
      return NextResponse.json(
        {
          message: `room not found`,
        },
        { status: 400 },
      );
    }

    // sirf order ka customer aur uska delivery boy hi chat kar sakte hain
    const participants = [
      String(room.user),
      String(room.assignedDeliveryBoy || ""),
    ];
    if (!participants.includes(String(senderId))) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    const message = await Message.create({
      roomId,
      text: cleanText,
      senderId,
      time,
    });

    return NextResponse.json(
      {
        message,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `save message error ${error}`,
      },
      { status: 500 },
    );
  }
}
