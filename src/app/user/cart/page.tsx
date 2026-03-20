"use client";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Image from "next/image";
import {
  decreaseQuantity,
  increaseQuantity,
  removeItemFromCart,
} from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

function CartPage() {
  const { cartData, subTotal, finalTotal, deliveryFee } = useSelector(
    (state: RootState) => state.cart,
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const FREE_DELIVERY_LIMIT = 500;
  const remaining = FREE_DELIVERY_LIMIT - subTotal;
  const progress = Math.min((subTotal / FREE_DELIVERY_LIMIT) * 100, 100);

  return (
    <div className="relative w-full max-w-[100vw] overflow-x-hidden text-white">
      {/* background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-3xl top-[-120px] left-[-120px]" />
        <div className="absolute w-[350px] h-[350px] bg-green-400/10 rounded-full blur-3xl bottom-[-120px] right-[-120px]" />
      </div>
      <div className="w-[95%] sm:w-[90%] mx-auto mb-10 relative mt-10">
        {/* back button */}
        <Link
          href="/"
          className="absolute -top-2 left-3 flex items-center gap-2
      text-white bg-white/10 py-2 px-4 rounded-full
      hover:bg-white/20 transition backdrop-blur"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:flex text-sm">Back</span>
        </Link>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-center text-emerald-400 mb-10"
        >
          🛒 Your Shopping Cart
        </motion.h2>

        {cartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-20 h-20 flex items-center justify-center
    rounded-full bg-white/10 backdrop-blur
    border border-white/10 mb-6"
            >
              <ShoppingCart className="w-10 h-10 text-emerald-400" />
            </div>

            <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
              Your Cart is Empty
            </h3>

            <p className="text-neutral-400 text-sm max-w-sm mb-6">
              Looks like you haven’t added anything yet. Start shopping and fill
              your cart with fresh groceries.
            </p>

            <Link
              href="/"
              className="flex items-center gap-2
    bg-emerald-600 hover:bg-emerald-700
    text-white text-sm font-medium
    px-6 py-2.5 rounded-full transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* cart items */}
            <div className="md:col-span-2 space-y-5">
              <AnimatePresence>
                {cartData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4
                  bg-white/5 backdrop-blur-xl
                  border border-white/10
                  rounded-2xl p-5
                  hover:bg-white/10 transition"
                  >
                    {/* image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/5 overflow-hidden shrink-0">
                      <Image
                        src={item.image || ""}
                        alt={item.name}
                        fill
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-white">{item.name}</h3>

                      <p className="text-sm text-neutral-400">
                        ₹{item.price} × {item.quantity}
                      </p>

                      <p className="text-emerald-400 font-semibold mt-1">
                        ₹{Number(item.price) * item.quantity}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-3
                  bg-white/10 rounded-lg px-3 py-1  mt-2 sm:mt-0"
                    >
                      <button
                        onClick={() => dispatch(decreaseQuantity(item._id))}
                        className="w-7 h-7 flex items-center justify-center
                      rounded-md hover:bg-white/20 transition"
                      >
                        -
                      </button>

                      <span className="text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => dispatch(increaseQuantity(item._id))}
                        className="w-7 h-7 flex items-center justify-center
                      rounded-md hover:bg-white/20 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* delete */}
                    <button
                      title="remove"
                      onClick={() => dispatch(removeItemFromCart(item._id))}
                      className="absolute top-3 right-3 sm:static text-red-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-1 mt-4 md:mt-0"
            >
              {/* free delivery */}
              <div className="mb-5">
                {subTotal < FREE_DELIVERY_LIMIT ? (
                  <p className="text-xs text-neutral-400 mb-2">
                    Add{" "}
                    <span className="text-emerald-400 font-semibold">
                      ₹{remaining}
                    </span>{" "}
                    more for
                    <span className="text-emerald-400 font-semibold">
                      {" "}
                      FREE delivery
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold mb-2">
                    🎉 You unlocked FREE delivery
                  </p>
                )}

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div
                className="bg-white/5 backdrop-blur-xl
    border border-white/10
    rounded-2xl p-6
    sticky top-24"
              >
                <h2 className="text-lg font-semibold text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-neutral-300">
                    <span>Subtotal</span>
                    <span>₹{subTotal}</span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-medium">
                          FREE
                        </span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-semibold text-white">
                    <span>Total</span>
                    <span className="text-emerald-400">₹{finalTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/user/checkout")}
                  className="mt-6 w-full
      bg-emerald-600 hover:bg-emerald-700
      text-white font-medium
      py-3 rounded-xl
      transition active:scale-[0.98] cursor-pointer"
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-neutral-400 text-center mt-3">
                  Taxes & delivery calculated at checkout
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
