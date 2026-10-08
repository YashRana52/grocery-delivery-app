"use client";

import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

// leaflet server pe import nahi ho sakta (window chahiye),
// isliye ye component checkout me ssr:false ke saath load hota hai
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

type Props = {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
};

function DraggableMarker({ position, onPositionChange }: Props) {
  const map = useMap();
  useEffect(() => {
    map.setView(position as LatLngExpression, 15, { animate: true });
  }, [position, map]);
  return (
    <Marker
      icon={markerIcon}
      position={position as LatLngExpression}
      draggable={true}
      eventHandlers={{
        dragend: (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          onPositionChange([lat, lng]);
        },
      }}
    />
  );
}

function CheckoutMap({ position, onPositionChange }: Props) {
  return (
    <MapContainer
      center={position as LatLngExpression}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-[300px] rounded-xl overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker position={position} onPositionChange={onPositionChange} />
    </MapContainer>
  );
}

export default CheckoutMap;
