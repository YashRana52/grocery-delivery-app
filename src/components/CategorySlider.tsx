"use client";

import {
  Apple,
  Baby,
  Box,
  Coffee,
  Cookie,
  Flame,
  Heart,
  Home,
  Milk,
  Wheat,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function CategorySlider() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const categories = [
    { id: 1, name: "Fruits & Vegetables", icon: Apple },
    { id: 2, name: "Dairy & Eggs", icon: Milk },
    { id: 3, name: "Rice, Atta & Grains", icon: Wheat },
    { id: 4, name: "Snacks & Biscuits", icon: Cookie },
    { id: 5, name: "Spices & Masalas", icon: Flame },
    { id: 6, name: "Beverages & Drinks", icon: Coffee },
    { id: 7, name: "Personal Care", icon: Heart },
    { id: 8, name: "Household Essentials", icon: Home },
    { id: 9, name: "Instant & Packaged Food", icon: Box },
    { id: 10, name: "Baby & Pet Care", icon: Baby },
  ];

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isStart = el.scrollLeft <= 0;
    const isEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    setShowLeft(!isStart);
    setShowRight(!isEnd);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkScroll();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false }}
      className="w-[90%] md:w-[80%] mx-auto mt-14 relative"
    >
      {" "}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
        🛒 Shop by Category{" "}
      </h2>
      {/* left button */}
      {showLeft && (
        <button
          title="scrollleft"
          onClick={scrollLeft}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10
      bg-white/10 backdrop-blur-md border border-white/10
      p-2 rounded-full hover:bg-white/20 transition"
        >
          <ChevronLeft className="text-white w-5 h-5" />
        </button>
      )}
      {/* right button */}
      {showRight && (
        <button
          title="scrollright"
          onClick={scrollRight}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10
      bg-white/10 backdrop-blur-md border border-white/10
      p-2 rounded-full hover:bg-white/20 transition"
        >
          <ChevronRight className="text-white w-5 h-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto px-2 pb-2 scrollbar-hide scroll-smooth"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -6 }}
              className="min-w-[140px] md:min-w-[170px] backdrop-blur-xl
          bg-white/5 border border-white/10 rounded-2xl
          flex flex-col items-center justify-center
          p-6 cursor-pointer transition-all
          hover:bg-white/10 hover:shadow-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Icon className="w-7 h-7 text-emerald-400" />
              </div>

              <p className="text-center text-sm md:text-base font-medium text-neutral-200">
                {cat.name}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default CategorySlider;
