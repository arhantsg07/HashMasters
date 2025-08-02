"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// ✅ Fix leaflet marker icon issues in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔥 Heatmap layer component
function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 10,
      maxZoom: 17,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function GeoMap() {
  const [userPosition, setUserPosition] = useState(null);
  const [userDBPosition, setUserDBPosition] = useState(null); // Logged-in user’s DB coordinates

  const [heatPoints, setHeatPoints] = useState([]);

  // 📍 Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setUserPosition([28.6139, 77.209]); // fallback: Delhi
        }
      );
    }
  }, []);

  useEffect(() => {
    async function fetchUserLocation() {
      try {
        const res = await fetch("http://localhost:8000/user/location"); // Your API for logged-in user
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setUserDBPosition([data.latitude, data.longitude]);
        }
      } catch (error) {
        console.error("Failed to fetch user DB location:", error);
      }
    }
    fetchUserLocation();
  }, []);

  // 🔗 Fetch heatmap points from FastAPI
  useEffect(() => {
    async function fetchHeatmapData() {
      try {
        const res = await fetch("http://localhost:8000/heatmap/coordinates");
        const data = await res.json();

        if (Array.isArray(data)) {
          const coords = data
            .filter((item) => item.latitude !== null && item.longitude !== null)
            .map((item) => [item.latitude, item.longitude]);

          setHeatPoints(coords);
        } else {
          console.error("Invalid API response:", data);
        }
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error);
      }
    }

    fetchHeatmapData();
  }, [userDBPosition]);

  // ⏳ Wait for position
  if (!userPosition) return <p>Loading map...</p>;

  return (
    <MapContainer
      center={userPosition} // ✅ FIXED: was "position"
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={userPosition}>
        <Popup>Your current location</Popup>
      </Marker>

      {/* 🔥 Heatmap Layer */}
      <HeatmapLayer points={heatPoints} />
    </MapContainer>
  );
}
