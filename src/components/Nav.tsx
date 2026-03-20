"use client";

import { RootState } from "@/redux/store";
import {
  Box,
  Boxes,
  ClipboardCheck,
  LogOut,
  Menu,
  Package,
  Plus,
  PlusCircle,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

function Nav({ user }: { user: IUser }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    router.push(`?search=${searchQuery}`);

    setSearchOpen(false);
    setSearchQuery("");
  };

  const { cartData } = useSelector((state: RootState) => state.cart);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      profileDropdown.current &&
      !profileDropdown.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };

  const profileDropdown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delay = setTimeout(() => {
      router.push(`?search=${searchQuery}`);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const Sidebar = menuOpen
    ? createPortal(
        <AnimatePresence>
          <motion.div
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed top-0 left-0 h-full w-[82%] sm:w-[60%] z-[9999]
      bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950
      border-r border-white/10 backdrop-blur-xl
      shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]
      flex flex-col text-white md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h1 className="text-lg font-semibold tracking-wide">
                Admin Panel
              </h1>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full
  bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center gap-3 py-6 border-b border-white/10">
              <div className="relative w-16 h-16">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="user"
                    fill
                    className="rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full
                  bg-white/10 flex items-center justify-center"
                  >
                    <User className="w-6 h-6 text-white/80" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <h2 className="font-semibold text-white">{user.name}</h2>
                <p className="text-sm text-emerald-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex flex-col gap-3 p-5">
              <Link
                href="/admin/add-grocery"
                className="flex items-center gap-3 px-4 py-3 rounded-xl
              bg-gradient-to-r from-emerald-500 to-green-600
              shadow-lg hover:scale-[1.03]
              hover:shadow-emerald-500/30
              transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Add Grocery
              </Link>

              <Link
                href="/admin/view-grocery"
                className="flex items-center gap-3 px-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              hover:bg-white/10 transition-all active:scale-95"
              >
                <Boxes className="w-5 h-5 text-emerald-400" />
                View Groceries
              </Link>

              <Link
                href="/admin/manage-orders"
                className="flex items-center gap-3 px-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              hover:bg-white/10 transition-all"
              >
                <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                Manage Orders
              </Link>
            </div>
            <div className="border-t border-white/10 my-4"></div>

            <div className="px-5">
              <button
                onClick={async () => await signOut({ callbackUrl: "/" })}
                type="button"
                className="flex items-center mt-20 gap-3 w-full px-4 py-3 rounded-xl
    bg-red-500/20 hover:bg-red-500/30
    text-red-400 font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-50">
      {/* NAVBAR CONTAINER */}
      <div
        className="flex items-center justify-between px-6 py-3 rounded-2xl 
      bg-white/10 backdrop-blur-xl border border-white/20 
      shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
      >
        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-extrabold bg-gradient-to-r 
          from-emerald-400 to-green-500 bg-clip-text text-transparent"
        >
          SnapCart
        </Link>

        {/* SEARCH */}
        {user.role == "user" && (
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 
          bg-white/10 border border-white/20
          px-4 py-2 rounded-full w-[40%]"
          >
            <Search className="w-4 h-4 text-neutral-300" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries..."
              className="bg-transparent outline-none text-sm text-white 
  placeholder:text-neutral-400 w-full"
            />
          </form>
        )}

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-4 relative">
          {user.role == "user" && (
            <>
              <div
                onClick={() => setSearchOpen((prev) => !prev)}
                className="bg-white/10 rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition md:hidden"
              >
                <Search className="text-green-600 w-6 h-6" />
              </div>
              {/* CART */}
              <Link
                href="/user/cart"
                className="relative flex items-center justify-center
            w-11 h-11 rounded-full bg-white/10 border border-white/20
            hover:bg-white/20 transition"
              >
                <ShoppingCart className="w-5 h-5 text-white" />

                <span
                  className="absolute -top-1 -right-1
            bg-emerald-500 text-white text-xs
            w-5 h-5 flex items-center justify-center
            rounded-full font-semibold shadow-lg"
                >
                  {cartData.length}
                </span>
              </Link>
            </>
          )}

          {user.role === "admin" && (
            <>
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/admin/add-grocery"
                  className="flex items-center gap-2 px-4 py-2 rounded-full
      bg-gradient-to-r from-green-500 to-emerald-600
      text-white font-medium shadow-lg hover:scale-105
      transition-all duration-200"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Grocery
                </Link>

                <Link
                  href="/admin/view-grocery"
                  className="flex items-center gap-2 px-4 py-2 rounded-full
      bg-white/10 backdrop-blur-md border border-white/20
      text-white hover:bg-white/20 transition-all active:scale-95"
                >
                  <Boxes className="w-5 h-5" />
                  View Grocery
                </Link>

                <Link
                  href="/admin/manage-orders"
                  className="flex items-center gap-2 px-4 py-2 rounded-full
      bg-white/10 backdrop-blur-md border border-white/20
      text-white hover:bg-white/20 transition-all"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  Manage Orders
                </Link>
              </div>

              <Menu
                onClick={() => setMenuOpen((prev) => !prev)}
                className="md:hidden w-10 h-10 p-2 text-green-700 bg-white/90 backdrop-blur-md rounded-full border border-green-100 shadow-sm hover:bg-green-100 hover:scale-105 transition-all duration-200 cursor-pointer"
              />
            </>
          )}

          {/* PROFILE */}
          <div className="relative" ref={profileDropdown}>
            <div
              onClick={() => setOpen(!open)}
              className="relative w-11 h-11 cursor-pointer"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt="user"
                  fill
                  className="rounded-full object-cover border border-white/30"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full 
                bg-white/20 flex items-center justify-center"
                >
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* DROPDOWN */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute right-0 mt-4 w-64 rounded-2xl
                  bg-neutral-900/95 backdrop-blur-xl
                  border border-white/10 shadow-2xl
                  p-4 text-white"
                >
                  {/* USER INFO */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="relative w-10 h-10">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="user"
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full 
                        bg-white/20 flex items-center justify-center"
                        >
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="leading-tight">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-neutral-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {/* MENU */}
                  <div className="mt-3 flex flex-col gap-1">
                    {user.role == "user" && (
                      <Link
                        href="user/my-orders"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3
                      px-3 py-2 rounded-lg
                      hover:bg-white/10 transition"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex items-center gap-3
                      px-3 py-2 rounded-lg
                      hover:bg-red-500/20 text-red-300
                      transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="fixed top-24 left-0 w-full px-4 z-50 md:hidden"
                >
                  <form onSubmit={handleSearch} className="w-full">
                    <div className="flex items-center gap-3 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-xl px-4 py-3 shadow-xl">
                      <Search size={18} className="text-neutral-400" />

                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search groceries..."
                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-neutral-500"
                      />

                      <button
                        title="btn"
                        type="button"
                        onClick={() => setSearchOpen(false)}
                        className="p-1 rounded-md hover:bg-neutral-800 transition"
                      >
                        <X size={18} className="text-neutral-400" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* sidebar */}
      {Sidebar}
    </nav>
  );
}

export default Nav;
