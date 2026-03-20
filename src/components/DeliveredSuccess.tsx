"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  IndianRupee,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DeliveredOrderPage({ orderId }: { orderId: string }) {
  const params = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/user/get-order/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-neutral-950 text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-neutral-800 rounded-full" />
          <div className="h-4 w-32 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-neutral-950 text-white p-6">
        <CheckCircle2 className="text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-neutral-400 mb-6">
          Please check the order ID or go back.
        </p>
        <Link
          href="/user/my-orders"
          className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-black text-white pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 z-10 bg-black/60 backdrop-blur-md py-3 -mx-4 px-4 -mt-6">
          <Link
            href="/user/my-orders"
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Orders</span>
          </Link>
          <p className="text-sm text-neutral-500">
            #{order._id?.slice(-6) || "—"}
          </p>
        </div>

        {/* Success Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4 pt-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-2">
            <CheckCircle2
              className="text-green-400"
              size={44}
              strokeWidth={2.5}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order Delivered!
          </h1>
          <p className="text-neutral-400 text-lg">Enjoy your meal 😋</p>
          <div className="text-sm text-neutral-500">
            Delivered on{" "}
            {order.deliveredAt
              ? new Date(order.deliveredAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "—"}
          </div>
        </motion.div>

        {/* Items Section */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h3 className="font-semibold text-lg">Order Items</h3>
          </div>
          <div className="divide-y divide-neutral-800">
            {order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex gap-4 p-4 hover:bg-neutral-800/40 transition-colors"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-neutral-700">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">{item.name}</p>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {item.quantity} × ₹{Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div className="text-right font-medium text-green-400 whitespace-nowrap">
                  ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex justify-between items-center">
          <span className="text-lg font-semibold">Total Amount</span>
          <div className="flex items-center gap-1 text-2xl font-bold text-green-400">
            <IndianRupee size={20} />
            {Number(order.totalAmount).toFixed(2)}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-lg">Delivery Details</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User size={18} className="text-neutral-400" />
              <span>{order.address?.fullName || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-neutral-400" />
              <span>{order.address?.mobile || "—"}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-neutral-400 mt-0.5" />
              <span className="text-neutral-300">
                {order.address?.fullAddress || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Partner */}
        {order.assignedDeliveryBoy && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-semibold text-lg">Delivery Partner</h3>
            <p className="text-neutral-300">{order.assignedDeliveryBoy.name}</p>
            <p className="text-sm text-neutral-400 flex items-center gap-2">
              <Phone size={16} />
              {order.assignedDeliveryBoy.mobile}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => router.push("/")}
            className="py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 font-semibold text-lg shadow-lg shadow-green-900/30 hover:brightness-110 transition"
          >
            Reorder
          </button>

          <button className="py-4 rounded-2xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition flex items-center justify-center gap-2">
            <Star size={18} />
            Rate Order
          </button>
        </div>
      </div>
    </div>
  );
}
