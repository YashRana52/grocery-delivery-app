import mongoose from "mongoose";

export interface IOrder {
  _id?: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId;

  items: {
    grocery: mongoose.Types.ObjectId;
    name: string;
    price: string;
    unit: string;
    image: string;
    quantity: number;
  }[];

  totalAmount: number;

  paymentMethod: "cod" | "online";

  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  isPaid: boolean;
  assignedDeliveryBoy?: mongoose.Types.ObjectId;
  assignment?: mongoose.Types.ObjectId;

  status: "pending" | "out of delivery" | "delivered";

  createdAt?: Date;
  updatedAt?: Date;
  deliveryOtp: string | null;
  otpExpires: Date | null;
  deliveryOtpVerification: boolean;
  deliveredAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },

        name: { type: String, required: true },
        price: { type: String, required: true },
        unit: { type: String },
        image: { type: String },
        quantity: { type: Number, required: true },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    address: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      fullAddress: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    status: {
      type: String,
      enum: ["pending", "out of delivery", "delivered"],
      default: "pending",
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
    deliveryOtp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },
    deliveryOtpVerification: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
