"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { IndianRupee, Package, Truck, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type PropType = {
  earning: {
    today: number;
    sevenDays: number;
    total: number;
  };
  stats: {
    title: string;
    value: number;
  }[];
  chartData: {
    day: string;
    orders: number;
  }[];
};

function AdminDashboardClient({ earning, stats, chartData }: PropType) {
  const [filter, setFilter] = useState<"today" | "sevenDays" | "total">(
    "today",
  );

  const currentEarning =
    filter === "today"
      ? earning.today
      : filter === "sevenDays"
        ? earning.sevenDays
        : earning.total;

  const title =
    filter === "today"
      ? "Today's Earnings"
      : filter === "sevenDays"
        ? "Last 7 Days Earnings"
        : "Total Earnings";

  const icons = [
    <Package className="text-emerald-400 w-7 h-7" />,
    <Users className="text-cyan-400 w-7 h-7" />,
    <Truck className="text-amber-400 w-7 h-7" />,
    <IndianRupee className="text-violet-400 w-7 h-7" />,
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black pt-28 pb-16">
      <div className="w-full max-w-[1400px] px-4 sm:px-6 md:px-8 mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold 
  break-words leading-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Admin Dashboard
          </motion.h1>

          <motion.select
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            title="filter"
            value={filter}
            className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/70 text-gray-200 
                       rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg 
                       focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 
                       outline-none transition-all duration-300 hover:bg-gray-700/70"
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="today">Today</option>
            <option value="sevenDays">Last 7 Days</option>
            <option value="total">Total</option>
          </motion.select>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl p-10 text-center
                     bg-gradient-to-br from-gray-800/30 to-gray-900/30 
                     backdrop-blur-2xl border border-gray-700/40 shadow-2xl
                     before:absolute before:inset-0 before:bg-gradient-to-br 
                     before:from-cyan-500/10 before:via-violet-500/5 before:to-transparent 
                     before:pointer-events-none"
        >
          <div className="relative z-10">
            <h2 className="text-lg md:text-xl font-medium text-gray-300 tracking-wide">
              {title}
            </h2>
            <p className="mt-4 text-5xl md:text-6xl font-black text-white tracking-tight">
              ₹{currentEarning.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              whileHover={{ scale: 1.04, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl p-6 overflow-hidden
                         bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 
                         shadow-xl hover:shadow-2xl hover:border-gray-600/70 
                         transition-all duration-400"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-900/5 to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <div className="relative flex items-center gap-5">
                {/* ICON */}
                <div
                  className="p-4 bg-gray-900/60 rounded-xl border border-gray-700/50 
                                shadow-inner group-hover:scale-110 transition-transform duration-300"
                >
                  {icons[i % icons.length]}
                </div>

                {/* TEXT */}
                <div>
                  <p className="text-sm text-gray-400 font-medium tracking-wide">
                    {s.title}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {s.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* CHART */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="rounded-3xl p-6 md:p-8 
             bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 
             shadow-xl"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-200 mb-6">
            Orders Overview (Last 7 Days)
          </h2>

          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 12 }} />

                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "10px",
                  }}
                  labelStyle={{ color: "#9CA3AF" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />

                <Bar dataKey="orders" radius={[10, 10, 0, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboardClient;
