"use client";

import { getSocket } from "@/lib/socket";
import axios from "axios";
import { Send, Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Theme } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

type Props = {
  orderId: string;
  deliveryBoyId: string;
};

type IMessage = {
  _id?: string;
  roomId: string;
  senderId: string;
  text: string;
  time: string;
};

function DeliveryChat({ orderId, deliveryBoyId }: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  //  JOIN ROOM + RECEIVE MESSAGE
  useEffect(() => {
    const socket = getSocket();

    socket.emit("join-room", orderId);

    socket.on("receive-message", (msg: IMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [orderId]);

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

  const sendMsg = () => {
    if (!newMessage.trim()) return;

    const socket = getSocket();

    const message: IMessage = {
      roomId: orderId,
      text: newMessage,
      senderId: deliveryBoyId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send-message", message);

    setNewMessage("");
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
        ?.filter((m) => m.senderId !== deliveryBoyId)
        .at(-1);
      const res = await axios.post("/api/chat/ai-suggestions", {
        message: lastMessage?.text,
        role: "delivery_boy",
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
                loading ? "animate-pulse text-white/50" : "text-indigo-400"
              }`}
            />

            <span className="text-white/90">
              {loading ? "Generating..." : "AI Suggest"}
            </span>
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {suggestions?.map((s, i) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 text-sm cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:border-white/20 active:bg-white/15"
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
              const isMe = msg.senderId === deliveryBoyId;

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
          className="bg-green-500 hover:bg-green-600 transition p-3 rounded-full text-white shadow-lg"
        >
          <Send size={18} />
        </button>

        {/* EMOJI PICKER */}
        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-16 left-2 z-50">
            <EmojiPicker onEmojiClick={handleEmoji} theme={Theme.DARK} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryChat;
