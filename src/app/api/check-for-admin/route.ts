import connectDb from "@/lib/db";
import User from "@/models/user.model";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const adminExist = await User.exists({ role: "admin" });
    return NextResponse.json(
      { adminExist: !!adminExist },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: `failed to get admin ${error}` },
      {
        status: 500,
      },
    );
  }
}
