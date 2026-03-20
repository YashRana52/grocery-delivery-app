"use client";

import L, { LatLngExpression, LatLngTuple } from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ILocation {
  latitude: number;
  longitude: number;
  heading?: number;
}

interface IProps {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation | null;
  className?: string;
}

function RecenterAutomatically({
  center,
  zoom = 15,
}: {
  center: LatLngExpression;
  zoom?: number;
}) {
  const map = useMapEvents({
    zoomend: () => {
      map.setView(center, map.getZoom(), {
        animate: true,
      });
    },
  });

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.3,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);

  return null;
}

const createCustomIcon = (url: string, size: [number, number] = [48, 48]) =>
  L.icon({
    iconUrl: url,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // bottom center
    popupAnchor: [0, -size[1] + 10],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    shadowSize: [68, 55],
    shadowAnchor: [22, 54],
  });

const userIcon = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
  [50, 50],
);

const deliveryIconBase = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/128/9561/9561688.png", // better bike/scooter icon
  [56, 56],
);

function DeliveryMarker({
  position,
  heading = 0,
}: {
  position: LatLngTuple;
  heading?: number;
}) {
  return (
    <Marker position={position} icon={deliveryIconBase}>
      <Popup className="text-center min-w-[140px]">
        <div className="font-semibold text-base">🛵 Delivery Partner</div>
        <div className="text-xs text-gray-500 mt-1">Moving toward you</div>
      </Popup>
    </Marker>
  );
}

export default function Livemap({
  userLocation,
  deliveryBoyLocation,
  className = "",
}: IProps) {
  const userPos: LatLngTuple = [userLocation.latitude, userLocation.longitude];

  const boyPos = deliveryBoyLocation
    ? [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
    : null;

  // Better center: middle between user & delivery boy (when both exist)
  const mapCenter = useMemo<LatLngExpression>(() => {
    if (!boyPos) return userPos;
    return [(userPos[0] + boyPos[0]) / 2, (userPos[1] + boyPos[1]) / 2];
  }, [userPos, boyPos]);

  const positions: LatLngTuple[] = boyPos
    ? [userPos as LatLngTuple, boyPos as LatLngTuple]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-gray-950 to-black ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none z-[450]" />

      <MapContainer
        center={mapCenter}
        zoom={boyPos ? 15 : 18}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <RecenterAutomatically center={mapCenter} zoom={boyPos ? 14 : 16} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* USER marker */}
        <Marker position={userPos} icon={userIcon}>
          <Popup className="text-center">
            <div className="font-semibold text-base">📍 Your Location</div>
          </Popup>
        </Marker>

        {/* DELIVERY BOY */}
        {boyPos && (
          <DeliveryMarker
            position={boyPos as LatLngTuple}
            heading={deliveryBoyLocation?.heading}
          />
        )}

        {positions.length === 2 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: "#22c55e",
              weight: 7,
              opacity: 0.85,
              dashArray: "1 10",
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-4 right-4 z-[600] flex items-center justify-between">
        <div className="bg-black/75 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
          <p className="text-xs text-emerald-300 font-medium tracking-wide">
            LIVE TRACKING ACTIVE
          </p>
          <h3 className="text-white font-semibold mt-0.5">
            {deliveryBoyLocation
              ? "Delivery is on the way "
              : "Waiting for rider location..."}
          </h3>
        </div>

        {deliveryBoyLocation && (
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl animate-pulse-fast">
            <span className="text-2xl">🛵</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
