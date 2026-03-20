import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "user is not authenticated" },
        { status: 401 },
      );
    }
    await connectDb();

    const user = await User.findOne({
      email: session.user.email,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "user is not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.log("GET ME ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
