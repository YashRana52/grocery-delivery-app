import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { canAccessOrder } from "@/lib/orderAccess";

import Message from "@/models/message.model";
import Order from "@/models/order.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await req.json();

    const room = mongoose.Types.ObjectId.isValid(roomId)
      ? await Order.findById(roomId)
      : null;
    if (!room || !canAccessOrder(session, room)) {
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
