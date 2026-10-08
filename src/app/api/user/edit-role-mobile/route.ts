import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

const allowedRoles = ["user", "deliveryBoy", "admin"];

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, mobile } = await req.json();

    if (!role || !mobile) {
      return NextResponse.json(
        { message: "Role and mobile required" },
        { status: 400 },
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    if (!/^[0-9]{10}$/.test(String(mobile))) {
      return NextResponse.json(
        { message: "Mobile must be 10 digits" },
        { status: 400 },
      );
    }

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // admin sirf ek hi ban sakta hai (jab koi admin na ho)
    if (role === "admin" && currentUser.role !== "admin") {
      const adminExist = await User.exists({ role: "admin" });
      if (adminExist) {
        return NextResponse.json(
          { message: "Admin already exists" },
          { status: 403 },
        );
      }
    }

    currentUser.role = role;
    currentUser.mobile = mobile;
    await currentUser.save();

    const user = currentUser.toObject();
    delete user.password;

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Edit role and mobile error" },
      { status: 500 },
    );
  }
}
