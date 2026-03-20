import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectDb();

    const { orderId } = await params;
    const { status } = await req.json();

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    order.status = status;

    let deliveryBoysPayload: any[] = [];

    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address;

      //  find nearby delivery boys
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 10000, // 10 km
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);

      //  find busy delivery boys
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((b) => String(b)));

      //  filter available boys
      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );

      const candidates = availableDeliveryBoys.map((b) => b._id);

      if (candidates.length === 0) {
        await order.save();

        //socket for status update
        await emitEventHandler("order-status-update", {
          orderId: order._id,
          status: order.status,
        });

        return NextResponse.json(
          { message: "No available delivery boys" },
          { status: 200 },
        );
      }

      //  create assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      await deliveryAssignment.populate("order");

      //socket for delivery boy notification
      for (const boyId of candidates) {
        const boy = await User.findById(boyId);
        if (boy.socketId) {
          await emitEventHandler(
            "new-assignment",
            {
              _id: deliveryAssignment._id,
              order: deliveryAssignment.order,
            },
            boy.socketId,
          );
        }
      }

      order.assignment = deliveryAssignment._id;

      //  prepare payload
      deliveryBoysPayload = availableDeliveryBoys.map((b) => ({
        id: b._id,
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
      }));

      await deliveryAssignment.populate("order");
    }

    await order.save();
    await order.populate("user");
    //socket for status update
    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
    });

    return NextResponse.json(
      {
        success: true,
        assignment: order.assignment ?? null,
        availableBoys: deliveryBoysPayload,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Order status update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
