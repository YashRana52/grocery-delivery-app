import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const groceryId = formData.get("groceryId") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;

    const file = formData.get("image");

    if (!groceryId || !name || !category || !unit || !price) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { message: "Price must be a positive number" },
        { status: 400 },
      );
    }

    const update: Record<string, string> = { name, category, unit, price };

    // nayi image aayi ho tabhi replace karo, warna purani image rehne do
    if (file instanceof Blob && file.size > 0) {
      const uploaded = await uploadOnCloudinary(file);

      if (!uploaded) {
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 },
        );
      }

      update.image = uploaded;
    }

    const grocery = await Grocery.findByIdAndUpdate(groceryId, update, {
      new: true,
      runValidators: true,
    });

    if (!grocery) {
      return NextResponse.json(
        { message: "Grocery not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ grocery }, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Edit grocery error" },
      { status: 500 },
    );
  }
}
