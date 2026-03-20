import connectDb from "@/lib/db";

import Message from "@/models/message.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { roomId, text, senderId, time } = await req.json();

    const room = await Order.findById(roomId);
    if (!room) {
      return NextResponse.json(
        {
          message: `room not found`,
        },
        { status: 400 },
      );
    }

    const message = await Message.create({
      roomId,
      text,
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
