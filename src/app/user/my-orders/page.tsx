"use client";

import {
  ArrowLeft,
  PackageCheck,
  Truck,
  Clock,
  FolderOpenDot,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";

import { getSocket } from "@/lib/socket";

import { IUser } from "@/models/user.model";
import { useRouter } from "next/navigation";

type OrderStatus = "pending" | "out of delivery" | "delivered";

type OrderStatusUpdate = {
  orderId: string;
  status: OrderStatus;
};

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

function MyOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const res = await axios.get("/api/user/my-orders");
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getMyOrders();
  }, []);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id?.toString() === orderId ? { ...o, assignedDeliveryBoy } : o,
        ),
      );
    });
    return () => socket.off("order-assigned");
  }, []);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: <Clock className="w-5 h-5" />,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        label: "Preparing Order",
        step: 1,
      },
      "out of delivery": {
        icon: <Truck className="w-5 h-5" />,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        label: "Out for Delivery",
        step: 2,
      },
      delivered: {
        icon: <PackageCheck className="w-5 h-5" />,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        label: "Delivered",
        step: 3,
      },
    };

    return (
      configs[status.toLowerCase() as keyof typeof configs] || configs.pending
    );
  };

  useEffect(() => {
    const socket = getSocket();

    const handleStatusUpdate = (data: OrderStatusUpdate) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id?.toString() === data.orderId
            ? { ...order, status: data.status }
            : order,
        ),
      );
    };

    socket.on("order-status-update", handleStatusUpdate);

    return () => {
      socket.off("order-status-update", handleStatusUpdate);
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm border border-white/10 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent flex items-center gap-3">
            <FolderOpenDot className="w-7 h-7" />
            My Orders
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-28">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <PackageCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-neutral-400">Loading your orders...</p>
          </div>
        )}

        {/* jb koi order n ho*/}
        {!loading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-neutral-400 text-center"
          >
            <FolderOpenDot className="w-24 h-24 mb-6 opacity-70" />

            <h2 className="text-xl font-medium mb-2 text-white">
              No orders yet
            </h2>

            <p className="text-sm mb-6">
              When you place an order, it will appear here
            </p>

            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-full
      bg-gradient-to-r from-emerald-500 to-green-400
      text-black font-semibold
      hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30
      transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Start Shopping
            </Link>
          </motion.div>
        )}

        {/* Orders */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const isExpanded = expandedOrder === order._id?.toString();

              return (
                <motion.div
                  key={order._id?.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:shadow-emerald-900/30 transition-all duration-500 overflow-hidden"
                >
                  {/* glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-green-400/10 blur-xl" />
                  </div>

                  {/* header */}
                  <div
                    className="px-5 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(
                        isExpanded ? null : order._id?.toString() || null,
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg} ${status.color}`}
                      >
                        {status.icon}
                      </div>

                      <div>
                        <p className="text-sm text-neutral-400">Order</p>
                        <p className="font-medium">
                          #{order._id?.toString().slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>

                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* progress */}
                  <div className="px-5 pb-5">
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{
                          width:
                            status.step === 1
                              ? "25%"
                              : status.step === 2
                                ? "65%"
                                : "100%",
                        }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)] rounded-full"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 text-xs text-center">
                      <div
                        className={`font-medium ${
                          status.step >= 1
                            ? "text-emerald-400"
                            : "text-neutral-500"
                        }`}
                      >
                        Order Placed
                      </div>

                      <div
                        className={`font-medium ${
                          status.step >= 2
                            ? "text-emerald-400"
                            : "text-neutral-500"
                        }`}
                      >
                        Out for Delivery
                      </div>

                      <div
                        className={`font-medium ${
                          status.step >= 3
                            ? "text-emerald-400"
                            : "text-neutral-500"
                        }`}
                      >
                        Delivered
                      </div>
                    </div>
                  </div>

                  {/* expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="px-5 pt-5 pb-6 space-y-5">
                          {/* items */}
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 hover:scale-[1.01] transition-all duration-300"
                              >
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium line-clamp-2">
                                    {item.name}
                                  </p>

                                  <p className="text-sm text-neutral-400 mt-0.5">
                                    {item.quantity} × ₹{item.price} /{" "}
                                    {item.unit}
                                  </p>
                                </div>

                                <div className="text-right font-semibold text-emerald-400 text-base whitespace-nowrap">
                                  ₹{Number(item.price) * item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* footer */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-white/10 text-sm">
                            {/* PAYMENT */}
                            <div className="text-neutral-400">
                              {order.paymentMethod.toUpperCase()} •{" "}
                              {order.isPaid ? (
                                <span className="text-emerald-400 font-medium">
                                  Paid
                                </span>
                              ) : (
                                <span className="text-amber-400 font-medium">
                                  Pending
                                </span>
                              )}
                            </div>

                            {/* DELIVERY BOY */}
                            {order.assignedDeliveryBoy && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-800/50 rounded-lg mt-0.5">
                                  <UserCheck
                                    size={16}
                                    className="text-emerald-400"
                                  />
                                </div>

                                <div className="text-slate-300 leading-relaxed">
                                  <p>
                                    Assigned to :{" "}
                                    <span className="font-medium text-slate-200">
                                      {order.assignedDeliveryBoy?.name}
                                    </span>
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <p className="text-sm text-slate-200">
                                      📞 +91 {order.assignedDeliveryBoy.mobile}
                                    </p>

                                    <a
                                      href={`tel:${order.assignedDeliveryBoy.mobile}`}
                                      className="px-2 py-1 text-xs font-medium
            bg-emerald-500/20 text-emerald-400
            border border-emerald-500/30
            rounded-md hover:bg-emerald-500/30
            transition"
                                    >
                                      Call
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TOTAL */}
                            <div className="flex items-center gap-3 md:justify-end">
                              <div className="text-lg font-bold text-white">
                                ₹{order.totalAmount}
                              </div>

                              {order.assignedDeliveryBoy && (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/user/track-order/${order._id?.toString()}`,
                                    )
                                  }
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium
      bg-emerald-500/10 text-emerald-400
      border border-emerald-500/30
      rounded-lg hover:bg-emerald-500/20
      hover:border-emerald-400/50
      transition-all duration-200 cursor-pointer"
                                >
                                  📍 Track Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrders;
