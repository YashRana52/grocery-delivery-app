import Grocery from "@/models/grocery.model";
import mongoose from "mongoose";
import { getDeliveryFee } from "./pricing";

type CartItemInput = { grocery?: string; quantity?: number };

export type OrderAddress = {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
};

// client se sirf grocery id aur quantity lete hain, price DB se aata hai
export async function buildOrderItems(items: CartItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const quantities = new Map<string, number>();
  for (const item of items) {
    const id = String(item?.grocery || "");
    const qty = Number(item?.quantity);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid grocery item");
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      throw new Error("Invalid quantity");
    }
    quantities.set(id, (quantities.get(id) || 0) + qty);
  }

  const groceries = await Grocery.find({ _id: { $in: [...quantities.keys()] } });
  if (groceries.length !== quantities.size) {
    throw new Error("Some items are no longer available");
  }

  const orderItems = groceries.map((g) => ({
    grocery: g._id,
    name: g.name,
    price: g.price,
    unit: g.unit,
    image: g.image,
    quantity: quantities.get(String(g._id))!,
  }));

  const subTotal = orderItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const totalAmount = subTotal + getDeliveryFee(subTotal);

  return { orderItems, subTotal, totalAmount };
}

export function validateAddress(address: Partial<OrderAddress> | undefined) {
  if (!address) throw new Error("Address is required");

  const required = [
    "fullName",
    "mobile",
    "city",
    "state",
    "pincode",
    "fullAddress",
  ] as const;
  for (const key of required) {
    if (!String(address[key] ?? "").trim()) {
      throw new Error(`Address ${key} is required`);
    }
  }

  const latitude = Number(address.latitude);
  const longitude = Number(address.longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error("Invalid delivery location");
  }

  return {
    fullName: String(address.fullName).trim(),
    mobile: String(address.mobile).trim(),
    city: String(address.city).trim(),
    state: String(address.state).trim(),
    pincode: String(address.pincode).trim(),
    fullAddress: String(address.fullAddress).trim(),
    latitude,
    longitude,
  };
}
