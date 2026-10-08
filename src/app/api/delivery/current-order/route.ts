import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();

    const deliveryBoyId = session?.user?.id;
    if (!deliveryBoyId || session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
    })
      .populate("order")
      .lean();

    if (!activeAssignment) {
      return NextResponse.json({ active: false }, { status: 200 });
    }

    return NextResponse.json(
      { active: true, assignment: activeAssignment },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: `failed to get active assignments ${error}` },
      { status: 500 },
    );
  }
}
