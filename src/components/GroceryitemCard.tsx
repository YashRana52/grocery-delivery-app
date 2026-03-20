"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
} from "@/redux/cartSlice";

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

function GroceryitemCard({ item }: { item: IGrocery }) {
  const disptach = useDispatch<AppDispatch>();
  const { cartData } = useSelector((state: RootState) => state.cart);
  const cartItem = cartData.find((i) => i._id.toString() == item._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: false }}
      className="flex flex-col overflow-hidden rounded-2xl
      bg-white/5 backdrop-blur-lg border border-white/10
      hover:border-emerald-500/40 transition-all duration-300
      hover:shadow-xl"
    >
      {/* image */}
      <div className="relative w-full aspect-[4/3] bg-white/5 overflow-hidden">
        <Image
          src={item.image || ""}
          fill
          alt={item.name}
          sizes="(max-width:768px) 100vw ,25vw"
          className="object-contain p-4"
        />
      </div>

      {/* content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-xs text-emerald-400 font-medium">{item.category}</p>

        <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2">
          {item.name}
        </h3>

        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-neutral-400">{item.unit}</span>
          <span className="text-emerald-400 font-semibold">₹{item.price}</span>
        </div>
        {!cartItem ? (
          <motion.button
            onClick={() => disptach(addToCart({ ...item, quantity: 1 }))}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            className="mt-3 flex items-center justify-center gap-2
bg-emerald-600 hover:bg-emerald-700
active:bg-emerald-800
text-white text-sm font-medium
py-2 rounded-lg
shadow-md hover:shadow-lg
transition-all duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
            Add To Cart
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-3 flex items-center justify-between
bg-emerald-600
text-white text-sm font-medium
py-1.5 px-2 rounded-lg
shadow-md transition"
          >
            <motion.button
              onClick={() => disptach(decreaseQuantity(item._id))}
              title="minus"
              whileTap={{ scale: 0.8 }}
              className="w-7 h-7 flex items-center justify-center
  rounded-md hover:bg-white/20 active:bg-white/30
  transition"
            >
              <Minus className="w-4 h-4" />
            </motion.button>

            <motion.span
              key={cartItem.quantity}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-semibold px-2"
            >
              {cartItem.quantity}
            </motion.span>

            <motion.button
              onClick={() => disptach(increaseQuantity(item._id))}
              title="plus"
              whileTap={{ scale: 0.8 }}
              className="w-7 h-7 flex items-center justify-center
  rounded-md hover:bg-white/20 active:bg-white/30
  transition"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default GroceryitemCard;
