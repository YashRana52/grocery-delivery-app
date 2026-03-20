import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: session?.user?.id,
      status: "broadcasted",
    }).populate("order");

    if (assignments.length === 0) {
      return NextResponse.json(
        { message: "no assignment found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: `failed to get assignments ${error}` },
      { status: 500 },
    );
  }
}
