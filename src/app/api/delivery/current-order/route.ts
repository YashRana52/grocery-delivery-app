import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    const deliveryBoyId = session?.user?.id;

    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
    })
      .populate({
        path: "order",
        populate: { path: "address" },
      })
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
