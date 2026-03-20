"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <ShieldX className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>

        <p className="text-neutral-400 mb-6">
          You are not authorized to access this page.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-5 py-2 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition"
          >
            Go Home
          </Link>

          <Link
            href="/login"
            className="px-5 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
