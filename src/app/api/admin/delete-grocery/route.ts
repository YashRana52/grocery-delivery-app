import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { groceryId } = await req.json();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const grocery = await Grocery.findByIdAndDelete(groceryId);

    return NextResponse.json(grocery, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get groceries error ${error}` },
      { status: 200 },
    );
  }
}
