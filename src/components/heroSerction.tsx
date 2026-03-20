"use client";

import { Leaf, Smartphone, Truck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

function HeroSection() {
  const slides = [
    {
      id: 1,
      icon: <Leaf className="w-16 h-16 text-green-400" />,
      title: "Fresh Organic Groceries",
      subtitle:
        "Farm-fresh fruits, vegetables and daily essentials delivered to your door.",
      btnText: "Shop Now",
      bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=2400&auto=format&fit=crop&q=100",
    },
    {
      id: 2,
      icon: <Truck className="w-16 h-16 text-yellow-400" />,
      title: "Fast Delivery",
      subtitle: "Groceries delivered to your home in minutes.",
      btnText: "Order Now",
      bg: "https://images.unsplash.com/photo-1642047291146-7916f38ebde0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 3,
      icon: <Smartphone className="w-16 h-16 text-blue-400" />,
      title: "Shop Anytime",
      subtitle: "Simple and smooth online grocery shopping experience.",
      btnText: "Start Shopping",
      bg: "https://plus.unsplash.com/premium_vector-1729726376553-284a05a7ef66?w=3000&auto=format&fit=crop&q=100",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-[95%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].bg}
            fill
            alt="hero"
            className="object-cover"
            sizes="100vw"
            priority
            quality={100}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="flex justify-center mb-4">
              {slides[current].icon}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              {slides[current].title}
            </h1>

            <p className="text-neutral-200 mb-6">{slides[current].subtitle}</p>

            <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition">
              {slides[current].btnText}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                current === i ? "w-8 bg-green-400" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
