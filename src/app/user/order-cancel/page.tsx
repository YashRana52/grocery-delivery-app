"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

function OrderCancel() {
  const router = useRouter();
  const [time, setTime] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push("/user/cart");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white px-6">
      {/* Glow Background */}
      <div className="absolute w-[400px] h-[400px] bg-red-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[350px] h-[350px] bg-rose-400/20 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-red-500/20 p-6 rounded-full">
            <XCircle size={70} className="text-red-400" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 tracking-tight">
          Order Cancelled ❌
        </h1>

        {/* Message */}
        <p className="text-neutral-400 mb-6 leading-relaxed">
          Your order process was cancelled. No payment has been processed. You
          can return to your cart and try again anytime.
        </p>

        {/* Countdown */}
        <div className="text-sm text-neutral-400 mb-4">
          Redirecting to your cart in{" "}
          <span className="text-white font-semibold">{time}</span> seconds
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-red-500"
          />
        </div>

        {/* Button */}
        <button
          onClick={() => router.push("/user/cart")}
          className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl font-medium shadow-lg active:scale-95"
        >
          Back To Cart
        </button>
      </motion.div>
    </div>
  );
}

export default OrderCancel;
