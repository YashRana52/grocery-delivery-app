"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Send, Sparkle } from "lucide-react";
import Link from "next/link";
import Livemap from "@/components/Livemap";
import dynamic from "next/dynamic";
import { getSocket } from "@/lib/socket";
import { Theme } from "emoji-picker-react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DeliveredSuccess from "@/components/DeliveredSuccess";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

type IMessage = {
  _id?: string;
  roomId: string;
  senderId: string;
  text: string;
  time: string;
};

function TrackOrder() {
  const { userData } = useSelector((state: RootState) => state.user);
  const params = useParams();
  const orderId = params?.orderId as string;
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  const [order, setOrder] = useState<any>();
  const [userLocation, setUserLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const result = await axios.post("/api/chat/messages", {
          roomId: orderId,
        });

        setMessages(result.data.messages || []);
      } catch (error) {
        console.log(error);
      }
    };

    getAllMessages();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const getOrder = async () => {
      try {
        const res = await axios.get(`/api/user/get-order/${orderId}`);
        const data = res.data.order;

        setOrder(data);

        setUserLocation({
          latitude: data.address.latitude,
          longitude: data.address.longitude,
        });

        if (data.assignedDeliveryBoy?.location?.coordinates) {
          setDeliveryBoyLocation({
            latitude: data.assignedDeliveryBoy.location.coordinates[1],
            longitude: data.assignedDeliveryBoy.location.coordinates[0],
          });
        }
      } catch (error: any) {
        console.log(error.response?.data || error);
      }
    };

    getOrder();
  }, [orderId]);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("update-deliveryBoy-location", (data) => {
      setDeliveryBoyLocation({
        latitude: data.location.coordinates[1] ?? data.location.latitude,
        longitude: data.location.coordinates[0] ?? data.location.longitude,
      });
    });

    return () => socket.off("update-deliveryBoy-location");
  }, [order]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  CLOSE EMOJI ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  //  JOIN ROOM + RECEIVE MESSAGE
  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    socket.emit("join-room", orderId);

    socket.on("receive-message", (msg: IMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [orderId]);

  const sendMsg = () => {
    if (!newMessage.trim()) return;

    const socket = getSocket();

    const message: IMessage = {
      roomId: orderId,
      text: newMessage,
      senderId: userData?.user._id!,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setSending(true);

    socket.emit("send-message", message);

    setNewMessage("");

    //  short delay
    setTimeout(() => {
      setSending(false);
    }, 500);
  };

  //  EMOJI SELECT
  const handleEmoji = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  //ai suggestion msg
  const getSuggestion = async () => {
    try {
      setLoading(true);
      const lastMessage = messages
        ?.filter((m) => m.senderId !== userData?.user._id)
        .at(-1);
      const res = await axios.post("/api/chat/ai-suggestions", {
        message: lastMessage?.text,
        role: "user",
      });
      setLoading(false);
      setSuggestions(res.data.suggestions);

      console.log("suggestions:", suggestions);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link
            href="/user/my-orders"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="text-right">
            <h1 className="text-2xl font-bold">Track Order</h1>
            <p className="text-sm text-neutral-400">
              Order #{order?._id?.toString().slice(-6) || "------"}
            </p>
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md
    ${
      order?.status === "pending"
        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        : order?.status === "out of delivery"
          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
          : order?.status === "delivered"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  `}
          >
            {order?.status}
          </div>
        </div>
        {order?.status === "delivered" ? (
          <DeliveredSuccess orderId={order._id} />
        ) : (
          <>
            {/* MAP */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl">
              <Livemap
                userLocation={userLocation}
                deliveryBoyLocation={deliveryBoyLocation}
              />
            </div>
            {/* chat component */}
            <div className="h-[460px] flex flex-col rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-black border border-white/10 shadow-2xl backdrop-blur-xl">
              {/* HEADER */}
              <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white/90 font-medium text-sm tracking-wide">
                    Quick Replies
                  </h2>

                  <motion.button
                    onClick={getSuggestion}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    disabled={loading}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full shadow-sm transition-all duration-200
    ${
      loading
        ? "bg-white/10 text-white/50 cursor-not-allowed"
        : "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-300 border border-indigo-500/30"
    }`}
                  >
                    <Sparkle
                      size={14}
                      className={`${
                        loading
                          ? "animate-pulse text-white/50"
                          : "text-indigo-400"
                      }`}
                    />

                    <span className="text-white/90">
                      {loading ? "Generating..." : "AI Suggest"}
                    </span>
                  </motion.button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-1.5 cursor-pointer text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:border-white/20 active:bg-white/15"
                      onClick={() => setNewMessage(s)}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="text-5xl mb-3">💬</div>

                    <h3 className="text-white text-sm font-semibold">
                      Start the conversation
                    </h3>

                    <p className="text-gray-400 text-xs mt-1 max-w-[220px]">
                      Send a message to your delivery partner about your order,
                      location, or anything important.
                    </p>

                    <div className="mt-4 text-[11px] text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      🚚 Rider is on the way
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isMe = msg.senderId === userData?.user._id;

                      return (
                        <motion.div
                          key={msg._id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-md
                            ${
                              isMe
                                ? "bg-green-500 text-white rounded-br-none"
                                : "bg-white/10 text-gray-200 rounded-bl-none"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span className="block text-[10px] mt-1 opacity-60 text-right">
                              {msg.time}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                <div ref={bottomRef} />
              </div>

              {/* INPUT */}
              <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/30 backdrop-blur-md relative">
                {/* EMOJI BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmoji(!showEmoji);
                  }}
                  className="text-xl px-2"
                >
                  😊
                </button>

                {/* INPUT */}
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMsg();
                    }
                  }}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 text-white placeholder:text-gray-400 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-green-500"
                />

                {/* SEND */}
                <button
                  title="btn"
                  onClick={sendMsg}
                  disabled={sending}
                  className={`p-3 rounded-full text-white shadow-lg transition
    ${
      sending
        ? "bg-green-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }`}
                >
                  {sending ? (
                    <span className="animate-spin inline-block">
                      <Send size={18} />
                    </span>
                  ) : (
                    <Send size={18} />
                  )}
                </button>

                {/* EMOJI PICKER */}
                {showEmoji && (
                  <div
                    ref={emojiRef}
                    className="absolute bottom-16 left-2 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmoji}
                      theme={Theme.DARK}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;
