import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, mobile } = await req.json();

    if (!role || !mobile) {
      return NextResponse.json(
        { message: "Role and mobile required" },
        { status: 400 },
      );
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { role, mobile },
      { returnDocument: "after" },
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Edit role and mobile error" },
      { status: 500 },
    );
  }
}
