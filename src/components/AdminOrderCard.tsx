"use client";

import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CreditCard,
  MapPin,
  Package,
  Phone,
  User,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

import Image from "next/image";
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

function AdminOrderCard({ order }: { order: IOrder }) {
  const statusFlow = ["pending", "out of delivery"];

  const statusColorMap: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "out of delivery": "bg-blue-500/15 text-blue-400 border-blue-500/30",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };

  const [showItems, setShowItems] = useState(false);
  const [status, setStatus] = useState<string>(order.status);

  const totalItemsCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const itemsTotalValue = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const result = await axios.post(
        `/api/admin/update-order-status/${orderId}`,
        {
          status,
        },
      );
      console.log(result.data);
      setStatus(status!);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllowedStatuses = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow.slice(currentIndex); // backward remove
  };

  useEffect(() => {
    const socket = getSocket();

    socket.on("order-status-update", (data) => {
      if (data.orderId.toString() == order?._id?.toString()) {
        setStatus(data.status);
      }
    });

    return () => {
      socket.off("order-status-update");
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-black backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Package size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              Order #{order._id?.toString().slice(-6)}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(order.createdAt!).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              order.isPaid
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              statusColorMap[status] ||
              "bg-slate-500/20 text-slate-300 border-slate-500/30"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* CUSTOMER + PAYMENT + STATUS */}
      <div className="grid md:grid-cols-2 gap-6 p-6 border-b border-slate-700/40">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <User size={16} className="text-emerald-400" />
            </div>
            <span className="font-medium text-slate-200">
              {order.address.fullName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <Phone size={16} className="text-emerald-400" />
            </div>
            <span className="text-slate-300">{order.address.mobile}</span>
            <a
              href={`tel:${order.address.mobile}`}
              className="px-2 py-1 text-xs font-medium
          bg-emerald-500/20 text-emerald-400
          border border-emerald-500/30
          rounded-md hover:bg-emerald-500/30
          transition"
            >
              Call
            </a>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg mt-0.5">
              <MapPin size={16} className="text-emerald-400" />
            </div>
            <span className="text-slate-300 leading-relaxed">
              {order.address.fullAddress}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <CreditCard size={16} className="text-emerald-400" />
            </div>
            <span className="text-slate-200">
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Update Status:</label>
            <div className="relative">
              {status == "delivered" ? (
                <p className="text-green-500">Delivered</p>
              ) : (
                <select
                  title="status"
                  className="appearance-none bg-slate-800/60 border border-slate-600 hover:border-emerald-500/50 focus:border-emerald-500 rounded-lg pl-3 pr-9 py-1.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                  value={status}
                  onChange={(e) =>
                    updateStatus(order._id?.toString()!, e.target.value)
                  }
                >
                  {getAllowedStatuses(status).map((st) => (
                    <option key={st} value={st}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {order.assignedDeliveryBoy && (
            <div className="flex items-start gap-3 mt-3">
              <div className="p-2 bg-slate-800/50 rounded-lg mt-0.5">
                <UserCheck size={16} className="text-emerald-400" />
              </div>

              <div className="text-slate-300 leading-relaxed">
                <p>
                  Assigned to :{" "}
                  <span className="font-medium text-slate-200">
                    {order.assignedDeliveryBoy?.name}
                  </span>
                </p>

                <div className="flex items-center gap-3 mt-1">
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
        </div>
      </div>

      {/* COLLAPSIBLE ITEMS SECTION */}
      <div className="border-b border-slate-700/40">
        <button
          onClick={() => setShowItems(!showItems)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <ShoppingBag size={18} className="text-emerald-400" />
            </div>
            <div>
              <span className="font-medium text-slate-200">
                {showItems ? "Hide Items" : "View Items"}
              </span>
              <span className="text-sm text-slate-400 ml-2">
                ({order.items.length} product
                {order.items.length !== 1 ? "s" : ""}, {totalItemsCount} item
                {totalItemsCount !== 1 ? "s" : ""})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-sm font-medium">
              ₹{itemsTotalValue.toLocaleString("en-IN")}
            </span>
            {showItems ? <ChevronUp size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {showItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-2 space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 transition-all duration-200"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700/50 shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">
                      {item.quantity} × ₹{item.price}{" "}
                      <span className="text-slate-500">/</span> {item.unit}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-emerald-400">
                      ₹
                      {(Number(item.price) * item.quantity).toLocaleString(
                        "en-IN",
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.quantity} item{item.quantity > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* TOTAL */}
      <div className="px-6 py-5 border-t border-slate-700/40 bg-slate-900/40">
        <div className="flex justify-end items-center gap-4">
          <span className="text-slate-300 font-medium">Grand Total</span>
          <span className="text-2xl font-bold text-emerald-400">
            ₹{Number(order.totalAmount).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminOrderCard;
