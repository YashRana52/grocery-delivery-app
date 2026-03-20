"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Package, Pencil, Search, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { IGrocery } from "@/models/grocery.model";
import Image from "next/image";
import { toast } from "sonner";

function ViewGrocery() {
  const router = useRouter();
  const [groceries, setGroceries] = useState<IGrocery[]>([]);
  const [editing, setEditing] = useState<IGrocery | null>(null);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Load all groceries once on mount
  useEffect(() => {
    const getGroceries = async () => {
      try {
        const res = await axios.get("/api/admin/get-groceries");
        setGroceries(res.data);
      } catch (err) {
        console.error("Failed to load groceries:", err);
        toast.error("Failed to load groceries");
      }
    };
    getGroceries();
  }, []);

  // When editing item changes → set initial preview to existing image
  useEffect(() => {
    if (editing) {
      setImagePreview(editing.image || null);
      setNewImageFile(null); // reset any previous upload
    } else {
      setImagePreview(null);
      setNewImageFile(null);
    }
  }, [editing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEdit = async () => {
    if (!editing) return;

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("groceryId", editing._id?.toString() || "");
      formData.append("name", editing.name.trim());
      formData.append("category", editing.category);
      formData.append("unit", editing.unit);
      formData.append("price", editing.price.toString());

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      await axios.post("/api/admin/edit-grocery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Grocery updated successfully");

      // Refresh list
      const res = await axios.get("/api/admin/get-groceries");
      setGroceries(res.data);

      setEditing(null);
      setNewImageFile(null);
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update grocery");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!editing?._id) return;

    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsDeleting(true);

    try {
      await axios.post("/api/admin/delete-grocery", {
        groceryId: editing._id,
      });

      toast.success("Item deleted successfully");

      // Refresh list
      const res = await axios.get("/api/admin/get-groceries");
      setGroceries(res.data);

      setEditing(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGroceries = groceries.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 sm:px-6 md:px-10 pt-24 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-white">
          <Package size={22} /> Manage Groceries
        </h1>
      </div>

      {/* SEARCH */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroceries.map((g) => (
          <motion.div
            key={g._id?.toString()}
            whileHover={{ scale: 1.03 }}
            className="group bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={g.image || "/placeholder-grocery.jpg"}
                alt={g.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white truncate">
                  {g.name}
                </h3>
                <p className="text-sm text-gray-400">{g.category}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-emerald-400">
                  ₹{g.price}{" "}
                  <span className="text-sm text-gray-400">/{g.unit}</span>
                </p>
                <button
                  onClick={() => setEditing(g)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  title="Edit item"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl scrollbar-hide"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white">
                  Edit Grocery
                </h2>
                <button
                  title="cut"
                  onClick={() => setEditing(null)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition"
                >
                  <X className="text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Image Preview + Upload */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden mb-5 border border-gray-700">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    No image
                  </div>
                )}

                <label
                  htmlFor="image-upload"
                  className="absolute bottom-3 right-3 p-2.5 bg-black/60 rounded-full cursor-pointer hover:bg-black/80 transition"
                >
                  <Upload size={18} className="text-white" />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Name
                  </label>
                  <input
                    title="name"
                    type="text"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Price (₹)
                  </label>
                  <input
                    title="price"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        price: e.target.value || "",
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Category
                  </label>
                  <select
                    title="cat"
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Unit
                  </label>
                  <select
                    title="unit"
                    value={editing.unit}
                    onChange={(e) =>
                      setEditing({ ...editing, unit: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Select unit</option>
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEdit}
                    disabled={isUpdating || isDeleting}
                    className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
                      ${
                        isUpdating || isDeleting
                          ? "bg-emerald-700 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500"
                      }`}
                  >
                    {isUpdating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={isUpdating || isDeleting}
                    className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
                      ${
                        isUpdating || isDeleting
                          ? "bg-red-700 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                  >
                    {isDeleting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewGrocery;
