import connectDb from "@/lib/db";

import Message from "@/models/message.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { roomId } = await req.json();

    const room = await Order.findById(roomId);
    if (!room) {
      return NextResponse.json(
        {
          message: `room not found`,
        },
        { status: 400 },
      );
    }

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(
      {
        messages: messages.reverse(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `get message error ${error}`,
      },
      { status: 500 },
    );
  }
}
