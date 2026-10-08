import { auth } from "@/auth";
import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDb();

    const { id } = await params;

    const session = await auth();

    const deliveryBoyId = session?.user?.id;

    if (!deliveryBoyId || session?.user?.role !== "deliveryBoy") {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const allreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
    });

    if (allreadyAssigned) {
      return NextResponse.json(
        { message: "already assigned to other order" },
        { status: 400 },
      );
    }

    // atomic update: do delivery boy ek saath accept karein to sirf ek ko milega
    const assignment = await DeliveryAssignment.findOneAndUpdate(
      { _id: id, status: "broadcasted", broadcastedTo: deliveryBoyId },
      {
        $set: {
          assignedTo: deliveryBoyId,
          status: "assigned",
          acceptedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!assignment) {
      return NextResponse.json(
        { message: "assignment expired or not available" },
        { status: 400 },
      );
    }

    const order = await Order.findById(assignment.order);

    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 400 });
    }

    order.assignedDeliveryBoy = deliveryBoyId;

    await order.save();

    await order.populate("assignedDeliveryBoy", "-password");

    //socket for accept order

    await emitEventHandler("order-assigned", {
      orderId: order._id.toString(),
      assignedDeliveryBoy: order.assignedDeliveryBoy,
    });

    await DeliveryAssignment.updateMany(
      { _id: { $ne: assignment._id }, broadcastedTo: deliveryBoyId },
      {
        $pull: { broadcastedTo: deliveryBoyId },
      },
    );

    return NextResponse.json(
      { message: "order accepted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: `failed to accept  order ${error}` },
      { status: 500 },
    );
  }
}
