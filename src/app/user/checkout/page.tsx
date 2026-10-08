"use client";
import {
  ArrowLeft,
  Building,
  CreditCard,
  CreditCardIcon,
  Home,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";

import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// leaflet window ke bina import nahi hota, isliye SSR off
const CheckoutMap = dynamic(() => import("@/components/CheckoutMap"), {
  ssr: false,
});

function CheckOut() {
  const { userData } = useSelector((state: RootState) => state.user);
  const { cartData, subTotal, finalTotal, deliveryFee } = useSelector(
    (state: RootState) => state.cart,
  );

  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.log("location error ", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      );
    }
  }, []);

  const handleSearchQuery = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearchLoading(true);
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");
      const provider = new OpenStreetMapProvider();

      const results = await provider.search({ query: searchQuery });
      if (results.length === 0) {
        toast.error("Location not found");
        return;
      }
      setPosition([results[0].y, results[0].x]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to search location");
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.user) {
      setAddress((prev) => ({
        ...prev,
        fullName: userData.user.name,
        mobile: userData.user.mobile || "",
      }));
    }
  }, [userData]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse`,
          {
            params: {
              lat: position[0],
              lon: position[1],
              format: "json",
            },
          },
        );

        const addr = res.data.address || {};
        // chhote shehar/gaon me "city" field nahi hota
        setAddress((prev) => ({
          ...prev,
          city:
            addr.city || addr.town || addr.village || addr.county || prev.city,
          state: addr.state || prev.state,
          pincode: addr.postcode || prev.pincode,
          fullAddress: res.data.display_name || prev.fullAddress,
        }));
      } catch (error) {
        console.log(error);
      }
    };

    fetchAddress();
  }, [position]);

  // order ka payload; price/total server khud DB se calculate karta hai
  const buildOrderPayload = () => {
    if (cartData.length === 0) {
      toast.error("Your cart is empty");
      return null;
    }
    if (!position) {
      toast.error("Please select your delivery location on the map");
      return null;
    }
    const missing = Object.values(address).some((v) => !String(v).trim());
    if (missing) {
      toast.error("Please fill all address fields");
      return null;
    }
    if (!/^[0-9]{10}$/.test(address.mobile.trim())) {
      toast.error("Please enter a valid 10 digit mobile number");
      return null;
    }
    return {
      items: cartData.map((item) => ({
        grocery: item._id,
        quantity: item.quantity,
      })),
      address: {
        ...address,
        latitude: position[0],
        longitude: position[1],
      },
    };
  };

  // cod method

  const handleCod = async () => {
    const payload = buildOrderPayload();
    if (!payload) return;
    try {
      setOrderLoading(true);

      await axios.post("/api/user/order", payload);

      router.push("/user/order-success?method=cod");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  //  handleOnlinePayment

  const handleOnlinePayment = async () => {
    const payload = buildOrderPayload();
    if (!payload) return;
    try {
      setOrderLoading(true);
      const result = await axios.post("/api/user/payment", payload);
      window.location.href = result.data.url;
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Payment failed to start");
      setOrderLoading(false);
    }
  };

  //current location pe jane k liye
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.log("location error ", err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      );
    }
  };

  return (
    <div className="relative w-full max-w-[100vw] overflow-x-hidden text-white scrollbar-hide">
      {/* background glow */}
      <div className="absolute w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-3xl top-[-120px] left-[-120px]" />
      <div className="absolute w-[350px] h-[350px] bg-green-400/10 rounded-full blur-3xl bottom-[-120px] right-[-120px]" />

      <div className="w-[92%] sm:w-[80%]  py-4  mx-auto text-white relative mt-6 ">
        {/* back button */}
        <Link
          href="/user/cart"
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
          className="text-2xl md:text-3xl font-bold text-emerald-400 mb-10 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-6 h-6 text-emerald-400" />
          Checkout
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* address + map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/10"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-300 mb-5">
              <MapPin size={18} className="text-emerald-400" />
              Delivery Address
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Full Name"
                  value={address?.fullName || ""}
                  onChange={(e) =>
                    setAddress({ ...address, fullName: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              {/* mobile */}
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={address?.mobile || ""}
                  onChange={(e) =>
                    setAddress({ ...address, mobile: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              {/* full address */}
              <div className="relative">
                <Home
                  className="absolute left-3 top-3 text-emerald-400"
                  size={18}
                />

                <textarea
                  rows={3}
                  placeholder="Full Address (Street, Area...)"
                  value={address?.fullAddress || ""}
                  onChange={(e) =>
                    setAddress({ ...address, fullAddress: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
                />
              </div>

              {/* city state pin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                    size={18}
                  />

                  <input
                    placeholder="City"
                    value={address?.city || ""}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="relative">
                  <Navigation
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                    size={18}
                  />

                  <input
                    placeholder="State"
                    value={address?.state || ""}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                    size={18}
                  />

                  <input
                    placeholder="Pincode"
                    value={address?.pincode || ""}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* location search */}
              <div className="flex gap-2 mt-4">
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  placeholder="Search city or area..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <button
                  onClick={handleSearchQuery}
                  disabled={searchLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  {searchLoading ? (
                    <Loader2 className="animate-spin " size={16} />
                  ) : (
                    " Search"
                  )}
                </button>
              </div>
              <div className="relative mt-6 h-[330px] rounded-xl overflow-hidden  shadow-inner border-white/10">
                {position && (
                  <CheckoutMap
                    position={position}
                    onPositionChange={setPosition}
                  />
                )}
                <motion.button
                  onClick={handleCurrentLocation}
                  whileTap={{ scale: 0.92 }}
                  className="absolute bottom-12 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999 cursor-pointer"
                >
                  <LocateFixed size={22} />
                </motion.button>
              </div>
            </div>
          </motion.div>
          {/* payment method */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/10 h-fit"
          >
            {/* heading */}
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-neutral-300">
              <CreditCard className="text-emerald-400" size={20} />
              Payment Method
            </h2>

            {/* payment options */}
            <div className="space-y-3 mb-6">
              {/* online */}
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex items-center justify-between w-full border rounded-xl px-4 py-3 transition
      ${
        paymentMethod === "online"
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-white/10 hover:bg-white/5"
      }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="text-emerald-400" size={18} />
                  <span className="text-sm text-neutral-200">
                    Pay Online (Stripe)
                  </span>
                </div>

                {paymentMethod === "online" && (
                  <span className="text-xs text-emerald-400 font-medium">
                    Selected
                  </span>
                )}
              </button>

              {/* cod */}
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center justify-between w-full border rounded-xl px-4 py-3 transition
      ${
        paymentMethod === "cod"
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-white/10 hover:bg-white/5"
      }`}
              >
                <div className="flex items-center gap-3">
                  <Truck className="text-emerald-400" size={18} />
                  <span className="text-sm text-neutral-200">
                    Cash On Delivery
                  </span>
                </div>

                {paymentMethod === "cod" && (
                  <span className="text-xs text-emerald-400 font-medium">
                    Selected
                  </span>
                )}
              </button>
            </div>

            {/* price summary */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subTotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-emerald-400" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-white/10">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* place order button */}
            <button
              disabled={orderLoading}
              onClick={() => {
                if (paymentMethod === "cod") {
                  handleCod();
                } else {
                  handleOnlinePayment();
                }
              }}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 transition py-3 rounded-xl font-medium text-white shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {orderLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : paymentMethod === "cod" ? (
                "Place Order"
              ) : (
                "Pay & Place Order"
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
