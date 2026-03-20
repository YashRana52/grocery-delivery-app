"use client";

import { Eye, EyeOff, Leaf, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const session = useSession();

  const formValid = email && password;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn("credentials", {
        email,
        password,
      });
      router.push("/");

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-black px-6 text-white overflow-hidden">
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>

        <p className="text-center text-neutral-400 mt-2 flex items-center justify-center gap-2">
          Fresh groceries await <Leaf className="w-4 h-4 text-emerald-400" />
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-4 h-4 text-neutral-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 w-4 h-4 text-neutral-400" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {showPassword ? (
              <EyeOff
                onClick={() => setShowPassword(false)}
                className="absolute right-4 top-4 w-4 h-4 cursor-pointer text-neutral-400 hover:text-white"
              />
            ) : (
              <Eye
                onClick={() => setShowPassword(true)}
                className="absolute right-4 top-4 w-4 h-4 cursor-pointer text-neutral-400 hover:text-white"
              />
            )}
          </div>

          {/* Register Button */}
          <button
            disabled={!formValid || loading}
            className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 
  ${
    formValid && !loading
      ? "bg-green-600 hover:bg-green-700 text-white"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Login account...
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-neutral-500 text-sm">
            <span className="flex-1 h-px bg-white/10" />
            OR
            <span className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            type="button"
            className="flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
          >
            <Image
              src="/assets/google.png"
              width={18}
              height={18}
              alt="google"
            />
            Continue with Google
          </button>

          {/* Login Link */}
          <p
            onClick={() => router.push("/register")}
            className="text-center text-neutral-400 text-sm mt-4"
          >
            Want to create an account?{" "}
            <span className="text-emerald-400 hover:underline cursor-pointer">
              Sign up
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
