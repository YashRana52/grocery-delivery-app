"use client";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";

function GeoUpdater({ userId }: { userId: string }) {
  // identity har (re)connect par bhejo, warna socketId purana reh jata hai
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();

    const sendIdentity = () => socket.emit("identity", userId);

    if (socket.connected) sendIdentity();
    socket.on("connect", sendIdentity);

    return () => {
      socket.off("connect", sendIdentity);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;
    const socket = getSocket();
    let lastUpdate = 0;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();

        if (now - lastUpdate < 2000) return; // 2 seconds

        lastUpdate = now;

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        socket.emit("update-location", {
          userId,
          latitude: lat,
          longitude: lon,
        });
      },
      (err) => {
        console.log(err);
      },
      { enableHighAccuracy: true },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userId]);
  return null;
}

export default GeoUpdater;
