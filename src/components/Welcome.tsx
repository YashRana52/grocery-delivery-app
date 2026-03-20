"use client";

import { ArrowRight, Bike, ShoppingBasket } from "lucide-react";
import { motion } from "motion/react";

type propType = {
  setStep: (s: number) => void;
};

function Welcome({ setStep }: propType) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white px-6">
      {/*  Background */}
      <div className="pointer-events-none absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl top-[-150px] left-[-150px]" />

      <div className="pointer-events-none absolute w-[400px] h-[400px] bg-red-500/10 rounded-full blur-3xl bottom-[-120px] right-[-120px]" />

      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent"
      >
        SnapCart
      </motion.h1>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-6 text-3xl md:text-4xl font-bold text-center leading-tight"
      >
        Fresh groceries. <br />
        <span className="text-emerald-400">Delivered at lightning speed.</span>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-6 text-neutral-400 text-lg max-w-xl text-center"
      >
        Order daily essentials, organic produce, and household items in just a
        few taps — and get them delivered to your doorstep in minutes.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex items-center justify-center gap-16 mt-14"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl"
        >
          <ShoppingBasket className="w-24 h-24 md:w-32 md:h-32 text-emerald-400 drop-shadow-xl" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl"
        >
          <Bike className="w-24 h-24 md:w-32 md:h-32 text-red-400 drop-shadow-xl" />
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={() => setStep(2)}
        className="mt-14 inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-green-600 hover:scale-105 hover:shadow-xl transition-all duration-300 text-white font-semibold py-4 px-10 rounded-full"
      >
        Get Started <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}

export default Welcome;
