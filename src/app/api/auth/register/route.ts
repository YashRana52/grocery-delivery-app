import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const name = String(body.name || "").trim();
    // schema email lowercase me save karta hai, isliye check bhi lowercase me
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(error);
    // DB se connect hi na ho to user ko saaf message dikhe
    const dbDown =
      error?.code === "ENOTFOUND" ||
      error?.name === "MongooseServerSelectionError";
    return NextResponse.json(
      {
        message: dbDown
          ? "Database se connect nahi ho pa raha, baad me try karein"
          : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
