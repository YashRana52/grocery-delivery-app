"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { clearCart } from "@/redux/cartSlice";
import { useDispatch } from "react-redux";
import axios from "axios";

function OrderSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();

  const [time, setTime] = useState(5);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let redirect: NodeJS.Timeout;

    const verifyPayment = async () => {
      try {
        const sessionId = params.get("session_id");
        const method = params.get("method");

        if (method === "cod") {
          dispatch(clearCart());
          setVerifying(false);

          timer = setInterval(() => {
            setTime((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          redirect = setTimeout(() => {
            router.push("/user/my-orders");
          }, 5000);

          return;
        }

        if (!sessionId) {
          router.push("/user/order-cancel");
          return;
        }

        const res = await axios.get(
          `/api/verify-payment?session_id=${sessionId}`,
        );

        if (!res.data.success) {
          router.push("/user/order-cancel");
          return;
        }

        dispatch(clearCart());
        setVerifying(false);

        timer = setInterval(() => {
          setTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        redirect = setTimeout(() => {
          router.push("/user/my-orders");
        }, 5000);
      } catch (error) {
        router.push("/user/order-cancel");
      }
    };

    verifyPayment();

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router, params, dispatch]);

  // payment verify loader
  if (verifying) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white">
        {/* Glow Background */}
        <div className="absolute w-[400px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full top-[-120px] left-[-120px]" />
        <div className="absolute w-[350px] h-[350px] bg-green-400/20 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />

        {/* Card */}
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl px-10 py-12 text-center shadow-2xl">
          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold mb-2">Verifying Payment</h2>

          {/* Message */}
          <p className="text-neutral-400 text-sm">
            Please wait while we confirm your transaction...
          </p>

          {/* Progress bar */}
          <div className="mt-6 w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white px-6">
      {/* Glow Background */}
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[350px] h-[350px] bg-green-400/20 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-emerald-500/20 p-6 rounded-full">
            <CheckCircle size={70} className="text-emerald-400" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 tracking-tight">
          Order Confirmed 🎉
        </h1>

        {/* Message */}
        <p className="text-neutral-400 mb-6 leading-relaxed">
          Your payment was successful and your order has been placed.
        </p>

        {/* Countdown */}
        <div className="text-sm text-neutral-400 mb-4">
          Redirecting to your orders in{" "}
          <span className="text-white font-semibold">{time}</span> seconds
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-emerald-500"
          />
        </div>

        {/* Button */}
        <button
          onClick={() => router.push("/user/my-orders")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all py-3 rounded-xl font-medium shadow-lg active:scale-95"
        >
          View My Orders
        </button>
      </motion.div>
    </div>
  );
}

export default OrderSuccess;
