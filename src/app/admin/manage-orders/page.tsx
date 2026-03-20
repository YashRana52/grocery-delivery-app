"use client";

import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";

import axios from "axios";
import { ArrowLeft, FolderOpenDot } from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface IOrder {
  _id?: string;

  user: string;

  items: {
    grocery: string;
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
  assignedDeliveryBoy?: IUser;
  assignment?: string;

  status: "pending" | "out of delivery" | "delivered";

  createdAt?: Date;
  updatedAt?: Date;
}

const ManageOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/admin/get-orders");
        setOrders(result.data.orders);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("new-order", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });
    socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id?.toString() === orderId ? { ...o, assignedDeliveryBoy } : o,
        ),
      );
    });
    socket.on("order-status-update", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id?.toString() === data.orderId
            ? { ...o, status: data.status }
            : o,
        ),
      );
    });
    return () => {
      socket.off("new-order");
      socket.off("order-assigned");
      socket.off("order-status-update");
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white overflow-hidden pb-20">
      {/* background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm border border-white/10 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent flex items-center gap-3">
            <FolderOpenDot className="w-7 h-7" />
            Manage Orders
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pt-28 space-y-6">
        {/* Loading */}
        {loading && (
          <p className="text-center text-neutral-400">Loading orders...</p>
        )}

        {/* Empty Orders */}
        {!loading && orders.length === 0 && (
          <p className="text-center text-neutral-400">No orders found</p>
        )}

        {/* Orders */}
        {orders?.map((order) => (
          <AdminOrderCard order={order} key={order._id?.toString()} />
        ))}
      </div>
    </div>
  );
};

export default ManageOrders;
