import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.id || session.user.role !== "deliveryBoy") {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: session.user.id,
      status: "broadcasted",
    }).populate("order");

    // khali list error nahi hai
    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: `failed to get assignments ${error}` },
      { status: 500 },
    );
  }
}
