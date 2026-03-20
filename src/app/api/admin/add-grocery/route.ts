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

    const file = formData.get("image") as Blob | null;

    if (!name || !category || !unit || !price) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    let imageUrl = "";

    if (file) {
      const uploaded = await uploadOnCloudinary(file);

      if (!uploaded) {
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 },
        );
      }

      imageUrl = uploaded;
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
