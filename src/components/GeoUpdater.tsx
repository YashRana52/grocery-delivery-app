"use client";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";

function GeoUpdater({ userId }: { userId: string }) {
  let socket = getSocket();

  socket.emit("identity", userId);

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;
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
