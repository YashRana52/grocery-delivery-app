import connectDb from "@/lib/db";
import User from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { userId, socketId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid userId" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        socketId,
        isOnline: true,
      },
      { new: true },
    );

    console.log("Updated User:", user);

    if (!user) {
      return NextResponse.json({ message: "user not found" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
