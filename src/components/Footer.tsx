"use client";

import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-400">
      <div className="w-[90%] md:w-[80%] mx-auto py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-green-500 mb-3">
            SnapCart 🛒
          </h2>
          <p className="text-sm text-gray-400">
            Fast and fresh grocery delivery at your doorstep. Quality you can
            trust.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-green-400 cursor-pointer">Home</li>
            <li className="hover:text-green-400 cursor-pointer">Shop</li>
            <li className="hover:text-green-400 cursor-pointer">Orders</li>
            <li className="hover:text-green-400 cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Support</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-green-400 cursor-pointer">Help Center</li>
            <li className="hover:text-green-400 cursor-pointer">
              Privacy Policy
            </li>
            <li className="hover:text-green-400 cursor-pointer">
              Terms & Conditions
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Contact Us</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail size={16} /> support@snapcart.com
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> +91 9569633102
            </p>
          </div>

          {/* Social */}
          <div className="flex gap-4 mt-4">
            <Facebook className="cursor-pointer hover:text-green-400" />
            <Instagram className="cursor-pointer hover:text-green-400" />
            <Twitter className="cursor-pointer hover:text-green-400" />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-neutral-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} SnapCart. All rights reserved.
      </div>
    </footer>
  );
}
