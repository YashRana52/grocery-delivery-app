"use client";

import { ShieldCheck, Database, Settings } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-400 ">
      <div className="w-[90%] md:w-[80%] mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left */}
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck size={16} className="text-green-500" />
          <span className="text-gray-300 font-medium">
            Admin Panel - SnapCart
          </span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
            <Database size={16} />
            <span>Database</span>
          </div>

          <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
            <Settings size={16} />
            <span>Settings</span>
          </div>
        </div>

        {/* Right */}
        <div className="text-xs text-gray-500 text-center md:text-right">
          <p>Version 1.0.0</p>
          <p>© {new Date().getFullYear()} SnapCart Admin</p>
        </div>
      </div>
    </footer>
  );
}
