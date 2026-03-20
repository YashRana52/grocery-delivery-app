import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { userId, location } = await req.json();

    if (!userId || !location) {
      return NextResponse.json({ message: "missing userId or location" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location,
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ message: "user not found" });
    }

    return NextResponse.json({ message: "location updated" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
