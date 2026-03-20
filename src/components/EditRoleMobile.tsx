"use client";

import axios from "axios";
import { Bike, User, UserCog, Check } from "lucide-react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { toast } from "sonner";

function EditRoleMobile() {
  const [roles, setRoles] = useState([
    { id: "admin", label: "Admin", icon: UserCog },
    { id: "user", label: "Customer", icon: User },
    { id: "deliveryBoy", label: "Delivery Partner", icon: Bike },
  ]);
  const router = useRouter();
  const { update } = useSession();
  const [selectedRole, setSelectedRole] = useState("");
  const [mobile, setMobile] = useState("");
  const [touched, setTouched] = useState(false);

  const isValidMobile = /^[0-9]{10}$/.test(mobile);
  const isFormValid = selectedRole && isValidMobile;
  const handleEdit = async () => {
    try {
      const res = await axios.post("/api/user/edit-role-mobile", {
        role: selectedRole,
        mobile,
      });
      await update({ role: selectedRole });

      toast.success("Role and mobile updated");

      router.push("/");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update role and mobile");
    }
  };

  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        const result = await axios.get("/api/check-for-admin");

        if (result.data.adminExist) {
          setRoles((prev) => prev.filter((r) => r.id !== "admin"));
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkForAdmin();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white px-6">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl top-[-150px] left-[-150px]" />
      <div className="pointer-events-none absolute w-[400px] h-[400px] bg-red-500/10 rounded-full blur-3xl bottom-[-120px] right-[-120px]" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          Choose Your Role
        </h1>
        <p className="text-neutral-400 mt-3">
          Tell us how you want to use SnapCart
        </p>
      </motion.div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 w-full max-w-4xl">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <motion.div
              key={role.id}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(role.id)}
              className={`relative cursor-pointer rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 border backdrop-blur-xl ${
                isSelected
                  ? "border-emerald-500 bg-white/10 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  : "border-white/10 bg-white/5 hover:border-emerald-400"
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1"
                >
                  <Check size={14} />
                </motion.div>
              )}

              <div className="p-5 rounded-full bg-emerald-500/10 text-emerald-400">
                <Icon size={32} />
              </div>

              <span className="mt-4 text-lg font-semibold">{role.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-14 flex flex-col items-center w-full"
      >
        <label className="text-neutral-300 mb-3 text-sm tracking-wide">
          Mobile Number
        </label>

        <input
          type="tel"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            setTouched(true);
          }}
          placeholder="Enter 10 digit mobile number"
          className={`w-full max-w-md px-5 py-4 rounded-2xl bg-white/5 border text-center text-lg backdrop-blur-md focus:outline-none transition-all ${
            touched && !isValidMobile
              ? "border-red-500 focus:border-red-500"
              : "border-white/10 focus:border-emerald-500"
          }`}
        />

        {touched && !isValidMobile && (
          <p className="text-red-400 text-sm mt-2">
            Please enter a valid 10 digit number
          </p>
        )}
      </motion.div>

      <motion.button
        onClick={handleEdit}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        disabled={!isFormValid}
        className={`mt-14 inline-flex items-center justify-center gap-2 px-12 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
          isFormValid
            ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            : "bg-white/10 text-neutral-500 cursor-not-allowed"
        }`}
      >
        Continue
      </motion.button>
    </div>
  );
}

export default EditRoleMobile;
