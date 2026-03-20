"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "motion/react";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Livemap from "./Livemap";
import DeliveryChat from "./DeliveryChat";
import { Loader, MapPin, Package, Phone } from "lucide-react";

interface ILocation {
  latitude: number;
  longitude: number;
}
type Props = {
  todayEarning: number;
  last7DaysEarning: number;
  totalEarning: number;
  dailyData: {
    date: string;
    orders: number;
    earning: number;
  }[];
  monthlyData: {
    month: string;
    earning: number;
  }[];
};

function DeliveryBoyDashboard({
  earning,
}: {
  earning: {
    today: number;
    last7Days: number;
    total: number;
    dailyData: any[];
    monthlyData: any[];
  };
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useSelector((state: RootState) => state.user);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setverifyOtpLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });

  useEffect((): any => {
    const socket = getSocket();
    socket.on("new-assignment", (deliveryAssignment) => {
      setAssignments((prev) => [...prev, deliveryAssignment]);
    });
    return () => socket.off("new-assignment");
  }, []);

  const handleAccept = async (id: string) => {
    try {
      setLoading(true);

      await axios.get(`/api/delivery/assignment/${id}/accept-assignment`);

      toast.success("Order Accepted ");

      const res = await axios.get("/api/delivery/current-order");

      if (res.data.active) {
        setActiveOrder(res.data.assignment);

        setUserLocation({
          latitude: res.data.assignment.order.address.latitude,
          longitude: res.data.assignment.order.address.longitude,
        });
      }

      setAssignments([]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  //fetch assignment
  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments");
      setAssignments([...result.data.assignments].reverse());
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  //fetch current order

  const fetchCurrentOrder = async () => {
    try {
      const res = await axios.get("/api/delivery/current-order");
      if (res.data.active) {
        setActiveOrder(res.data.assignment);
        setUserLocation({
          latitude: res.data.assignment.order.address.latitude,
          longitude: res.data.assignment.order.address.longitude,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!userData?.user._id) return;
    if (!navigator.geolocation) return;
    let lastUpdate = 0;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();

        if (now - lastUpdate < 3000) return; // 2 seconds

        lastUpdate = now;

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setDeliveryBoyLocation({
          latitude: lat,
          longitude: lon,
        });

        socket.emit("update-location", {
          userId: userData.user._id,
          latitude: lat,
          longitude: lon,
        });
      },
      (err) => {
        console.log(err);
      },
      { enableHighAccuracy: true },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userData?.user._id]);

  useEffect(() => {
    fetchCurrentOrder();

    fetchAssignments();
  }, [userData]);

  //send otp

  const sendOtp = async () => {
    try {
      setSendOtpLoading(true);
      const res = await axios.post("/api/delivery/otp/send", {
        orderId: activeOrder.order._id,
      });
      console.log(res.data);
      setShowOtpBox(true);
      setSendOtpLoading(false);
      toast.success(res.data.message || res.data);
    } catch (error) {
      console.log(error);
      setSendOtpLoading(false);
    }
  };
  //verify otp

  const verifyOtp = async () => {
    try {
      setverifyOtpLoading(true);
      const res = await axios.post("/api/delivery/otp/verify", {
        orderId: activeOrder.order._id,
        otp,
      });
      setActiveOrder(null);
      setverifyOtpLoading(false);
      toast.success(res.data.message || res.data);
      await fetchCurrentOrder();
    } catch (error: any) {
      console.log("FULL ERROR:", error);
      console.log("BACKEND ERROR:", error.response?.data);

      setOtpError(error.response?.data?.message || "OTP verification failed");
      setverifyOtpLoading(false);
    }
  };

  useEffect(() => {
    if (showOtpBox) {
      inputRefs.current[0]?.focus();
    }
  }, [showOtpBox]);

  if (activeOrder && userLocation) {
    return (
      <div className="p-4 min-h-screen pt-[120px] bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Heading */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              Active Delivery
            </h1>

            {/* Order ID */}
            <p className="text-sm text-neutral-400">
              Order # {activeOrder.order._id?.toString().slice(-6) || "------"}
            </p>
          </div>

          {/* Map Container */}
          <div className="rounded-2xl border border-white/10 shadow-lg overflow-hidden bg-white/5 backdrop-blur-sm">
            <Livemap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>
          <DeliveryChat
            orderId={activeOrder?.order?._id?.toString()}
            deliveryBoyId={userData?.user?._id?.toString()!}
          />
          <div className="mt-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            {/*  Delivered State */}
            {activeOrder.order.deliveryOtpVerification && (
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="text-green-400 text-3xl">✔</div>
                <p className="text-lg font-semibold text-white">
                  Delivered Successfully
                </p>
                <p className="text-sm text-neutral-400">
                  Order has been completed
                </p>
              </div>
            )}

            {/*  Send OTP Button */}
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
              <button
                onClick={sendOtp}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {sendOtpLoading ? <Loader size={16} /> : "Mark as Delivered"}
              </button>
            )}

            {/*  OTP BOX */}
            {showOtpBox && !activeOrder.order.deliveryOtpVerification && (
              <div className="flex flex-col items-center gap-4 mt-2">
                <p className="text-sm text-neutral-400">
                  Enter 4-digit OTP to confirm delivery
                </p>

                {/* OTP INPUT BOXES */}
                <div className="flex gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      title="sm"
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (!val) return;

                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join(""));

                        //  move to next input
                        if (i < 3) {
                          inputRefs.current[i + 1]?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        //  backspace pe previous pe ja
                        if (e.key === "Backspace") {
                          const newOtp = otp.split("");
                          newOtp[i] = "";
                          setOtp(newOtp.join(""));

                          if (i > 0) {
                            inputRefs.current[i - 1]?.focus();
                          }
                        }
                      }}
                      className="w-12 h-12 text-center text-xl rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ))}
                </div>

                {/* ERROR */}
                {otpError && <p className="text-red-400 text-sm">{otpError}</p>}

                {/* VERIFY BUTTON */}
                <button
                  onClick={verifyOtp}
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  {verifyOtpLoading ? <Loader size={16} /> : "Verify OTP"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0f172a] p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mt-[110px] mb-8 text-white">
          Delivery Assignments
        </h2>
        {assignments.length === 0 && (
          <div className="flex items-center justify-between rounded-2xl border mb-3 border-amber-500/20 bg-amber-500/10 backdrop-blur-xl px-5 py-4 shadow-md">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <svg
                  className="h-5 w-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  No Active Deliveries
                </p>
                <p className="text-xs text-amber-200/70">
                  You’re currently not assigned to any delivery. Stay ready
                </p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="text-xs font-medium text-amber-300 hover:text-white transition"
            >
              Refresh
            </button>
          </div>
        )}

        {/* No assignment  */}
        {assignments.length === 0 && (
          <div className="space-y-8">
            {/* KPI Cards - Modern & Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Today Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 to-indigo-900/20 border border-indigo-500/15 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-300/80">
                        Today Earnings
                      </p>
                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        ₹{earning.today.toLocaleString()}
                      </h3>
                    </div>
                    <div className="rounded-xl bg-indigo-500/20 p-3">
                      <svg
                        className="h-6 w-6 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last 7 Days */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border border-emerald-500/15 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-300/80">
                        Last 7 Days
                      </p>
                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        ₹{earning.last7Days.toLocaleString()}
                      </h3>
                    </div>
                    <div className="rounded-xl bg-emerald-500/20 p-3">
                      <svg
                        className="h-6 w-6 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Earnings */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 to-amber-900/20 border border-amber-500/15 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-300/80">
                        Total Earnings
                      </p>
                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        ₹{earning.total.toLocaleString()}
                      </h3>
                    </div>
                    <div className="rounded-xl bg-amber-500/20 p-3">
                      <svg
                        className="h-6 w-6 text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Line Chart */}
              <div className="rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl shadow-2xl p-6 transition-all hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    Daily Earnings Trend
                  </h2>
                  <span className="text-xs text-neutral-400">Last 7 days</span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart
                    data={earning.dailyData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorEarnings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value}`}
                      domain={[0, "dataMax"]}
                      tickCount={4}
                      interval={0}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.98)",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                      }}
                      labelStyle={{ color: "#e5e7eb", fontWeight: 600 }}
                      formatter={(value) => {
                        const val = Number(value) || 0;
                        return [`₹${val.toLocaleString()}`, "Earnings"];
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="earning"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#colorEarnings)"
                      fillOpacity={1}
                      dot={{ r: 0 }}
                      activeDot={{
                        r: 7,
                        stroke: "#6366f1",
                        strokeWidth: 3,
                        fill: "#111827",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Earnings - Enhanced Bar Chart */}
              <div className="rounded-3xl bg-gradient-to-br from-neutral-900/60 to-neutral-950/60 border border-white/5 backdrop-blur-2xl shadow-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.25)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Monthly Earnings Overview
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">
                      Year-to-date breakdown
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      ₹{earning.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">Lifetime Total</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={earning.monthlyData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#22c55e"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#16a34a"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="month"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${Number(value) || 0}`}
                      domain={[0, "dataMax"]}
                      tickCount={4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.98)",
                        border: "1px solid rgba(34,197,94,0.4)",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                      }}
                      labelStyle={{ color: "#e5e7eb", fontWeight: 600 }}
                      formatter={(value) => [`₹${value ?? 0}`, "Earning"]}
                    />

                    <Bar
                      dataKey="earning"
                      fill="url(#colorBar)"
                      radius={[12, 12, 0, 0]}
                      barSize={40}
                      label={{
                        position: "top",
                        fill: "#9ca3af",
                        fontSize: 12,
                        formatter: (value) => {
                          const val = Number(value) || 0;
                          return `₹${(val / 1000).toFixed(0)}k`;
                        },
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {assignments.map((a) => (
          <motion.div
            key={a._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-lg
            border border-white/10
            hover:border-emerald-500/40
            rounded-2xl p-5 mb-6
            transition-all duration-300
            shadow-xl"
          >
            {/* Order Header */}
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-lg text-white">
                Order #{a.order?._id?.toString().slice(-6) || "------"}
              </p>

              <span
                className="text-xs px-3 py-1 rounded-full
                bg-emerald-500/10 text-emerald-400"
              >
                {a.order.status}
              </span>
            </div>

            {/* Customer */}
            <p className="font-medium text-white mb-1">
              {a.order.address.fullName}
            </p>

            {/* Address */}
            <div className="flex gap-2 text-neutral-400 text-sm mb-2">
              <MapPin size={16} />
              <p>{a.order.address.fullAddress}</p>
            </div>

            {/* Phone */}
            <div className="flex gap-2 text-neutral-400 text-sm mb-3">
              <Phone size={16} />
              <p>{a.order.address.mobile}</p>
            </div>

            {/* Items */}
            <div className="mb-3">
              <p className="font-semibold flex items-center gap-2 text-white mb-1">
                <Package size={16} /> Items
              </p>

              {a.order.items.map((item: any, i: number) => (
                <p key={i} className="text-sm text-neutral-400">
                  {item.name} × {item.quantity}
                </p>
              ))}
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-4">
              <p>Total: ₹{a.order.totalAmount}</p>
            </div>

            {/* Payment */}
            <p className="text-sm text-neutral-400 mb-4">
              Payment: {a.order.paymentMethod}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAccept(a?._id!)}
                disabled={loading}
                className="flex-1 py-2 rounded-lg
  bg-emerald-600 hover:bg-emerald-500
  text-white font-medium
  transition disabled:opacity-60"
              >
                {loading ? "Accepting..." : "Accept"}
              </button>

              <button
                className="flex-1 py-2 rounded-lg
                bg-red-500 hover:bg-red-400
                text-white font-medium
                transition"
              >
                Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
