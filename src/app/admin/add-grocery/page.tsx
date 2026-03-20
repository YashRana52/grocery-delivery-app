"use client";

import { ArrowLeft, Loader, PlusCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Biscuits",
  "Spices & Masalas",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
];

const units = ["kg", "g", "liter", "ml", "piece", "pack"];

function AddGrocery() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [backendImage, setBackendImage] = useState<File | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackendImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("unit", unit);
      formData.append("price", price);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      setLoading(true);

      const result = await axios.post("/api/admin/add-grocery", formData);
      toast.success("grocery added successfully");

      setLoading(false);
      //  form reset
      setName("");
      setCategory("");
      setUnit("");
      setPrice("");
      setBackendImage(null);
      setPreview(null);
    } catch (error) {
      console.log(error);
      toast.error("failed to add grocery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-black px-6 text-white overflow-hidden">
      {/* glow bg */}
      <div className="absolute w-350px h-350px bg-emerald-500/20 rounded-full blur-3xl top-[-120px] left-[-120px]" />
      <div className="absolute w-350px h-350px bg-green-400/10 rounded-full blur-3xl bottom-[-120px] right-[-120px]" />

      {/* back button */}

      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white bg-white/10 py-2 px-4 rounded-full hover:bg-white/20 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:flex text-sm">Back</span>
      </Link>

      {/* card */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* heading */}

        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold">Add Grocery Item</h1>
          </div>

          <p className="text-neutral-400 text-sm mt-1 text-center">
            Add a new product to inventory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* name */}

          <div>
            <label className="text-sm text-neutral-300">Grocery Name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Milk, Apple..."
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* category + unit */}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-300">Category</label>

              <select
                title="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" className="text-white bg-gray-800">
                  Select
                </option>

                {categories.map((cat) => (
                  <option key={cat} className="text-white bg-gray-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-neutral-300">Unit</label>

              <select
                title="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" className="text-white bg-gray-800">
                  Select
                </option>

                {units.map((u) => (
                  <option key={u} className="text-white bg-gray-800">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-300">Price ₹</label>

              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="100"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* upload */}

          <div>
            <label className="text-sm text-neutral-300">Product Image</label>

            <label className="mt-2 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center p-5 cursor-pointer hover:bg-white/5 transition">
              <UploadCloud className="w-6 h-6 text-emerald-400 mb-2" />

              <p className="text-xs text-neutral-400">Click to upload image</p>

              <input type="file" className="hidden" onChange={handleImage} />
            </label>

            {preview && (
              <Image
                src={preview}
                alt="product preview"
                width={96}
                height={96}
                className="mt-3 object-cover rounded-lg border border-white/10"
              />
            )}
          </div>

          {/* button */}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              "Add Grocery"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default AddGrocery;
