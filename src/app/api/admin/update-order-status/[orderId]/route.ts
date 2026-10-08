import { auth } from "@/auth";
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

    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { orderId } = await params;
    const { status } = await req.json();

    if (!["pending", "out of delivery"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // status sirf aage badh sakta hai (pending -> out of delivery)
    if (
      order.status === "delivered" ||
      (order.status === "out of delivery" && status === "pending")
    ) {
      return NextResponse.json(
        { message: `Cannot change status from ${order.status} to ${status}` },
        { status: 400 },
      );
    }

    order.status = status;

    let deliveryBoysPayload: any[] = [];

    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address;

      //  busy boys (jinke paas already order hai) ko hata do
      const filterAvailable = async (boys: any[]) => {
        const busyIds = await DeliveryAssignment.find({
          assignedTo: { $in: boys.map((b) => b._id) },
          status: { $nin: ["broadcasted", "completed"] },
        }).distinct("assignedTo");

        const busyIdSet = new Set(busyIds.map((b) => String(b)));
        return boys.filter((b) => !busyIdSet.has(String(b._id)));
      };

      //  pehle nearby (10 km) delivery boys dhundo
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

      let availableDeliveryBoys = await filterAvailable(nearByDeliveryBoys);

      // abhi ke liye range zaruri nahi: nearby koi free nahi mila to
      // sabhi delivery boys ko request bhej do, chahe kitne bhi door ho
      if (availableDeliveryBoys.length === 0) {
        const allDeliveryBoys = await User.find({ role: "deliveryBoy" });
        availableDeliveryBoys = await filterAvailable(allDeliveryBoys);
      }

      const candidates = availableDeliveryBoys.map((b) => b._id);

      // koi delivery boy nahi mila to order pending hi rehne do,
      // warna wo "out of delivery" me bina rider ke atak jayega
      if (candidates.length === 0) {
        return NextResponse.json(
          { success: false, message: "No available delivery boys" },
          { status: 409 },
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
      for (const boy of availableDeliveryBoys) {
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
        latitude: b.location?.coordinates?.[1] ?? null,
        longitude: b.location?.coordinates?.[0] ?? null,
      }));
    }

    await order.save();
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
