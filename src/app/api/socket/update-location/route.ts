import connectDb from "@/lib/db";
import User from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// ye route socket server call karta hai
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { userId, location } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(userId) || !location) {
      return NextResponse.json(
        { message: "missing userId or location" },
        { status: 400 },
      );
    }

    const [longitude, latitude] = (location.coordinates || []).map(Number);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      return NextResponse.json({ message: "invalid location" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: { type: "Point", coordinates: [longitude, latitude] },
      },
      { new: true },
    ).select("role");

    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    // socket server isse decide karta hai ki location broadcast kare ya nahi
    return NextResponse.json(
      { message: "location updated", role: user.role },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
