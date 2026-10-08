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
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;

    const file = formData.get("image");

    if (!name || !category || !unit || !price) {
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

    // schema me image required hai
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json(
        { message: "Product image is required" },
        { status: 400 },
      );
    }

    const imageUrl = await uploadOnCloudinary(file);

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image upload failed" },
        { status: 500 },
      );
    }

    const grocery = await Grocery.create({
      name,
      category,
      unit,
      price,
      image: imageUrl,
    });

    return NextResponse.json({ grocery }, { status: 201 });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ message: "Add grocery error" }, { status: 500 });
  }
}
