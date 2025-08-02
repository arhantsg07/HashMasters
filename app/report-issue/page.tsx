"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
// import { Icon } from "leaflet";
import { supabase } from "../auth";
import EXIF from "exif-js"; // Import the exif-js library

const MapContainer = dynamic(
  () => import("react-leaflet").then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then(mod => mod.Marker),
  { ssr: false }
);

// const markerIcon = new Icon({
//   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

const MapEventHandler = dynamic(
  () => import("react-leaflet").then(mod => {
    const { useMapEvents } = mod;
    return function MapClickHandler({ onMapClick }) {
      useMapEvents({
        click: onMapClick,
      });
      return null;
    };
  }),
  { ssr: false }
);

export default function ReportCrimePage() {
  const [files, setFiles] = useState<File[]>([]); // Multiple files
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const [manual, setManual] = useState(false);
  const [markerIcon, setMarkerIcon] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [form, setForm] = useState({
    user_id: "", // This should be set from your auth context
    category:"",
    files:[],
    description:"",
    anonymous: false, // Keep if you want to handle anonymous reporting on the frontend or backend
  });

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import and setup Leaflet icon
    const setupLeafletIcon = async () => {
      if (typeof window !== "undefined") {
        const L = await import("leaflet");
        
        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
        });

        const customIcon = new L.Icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        setMarkerIcon(customIcon);
      }
    };
    
    setupLeafletIcon();
  }, []);

  // Drag and drop (multiple files)
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  // Geolocation
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(newLoc);
          setForm(prevForm => ({ ...prevForm, address: "Fetching address..." })); // Placeholder
          if (mapInstance) {
            mapInstance.setView([newLoc.lat, newLoc.lng], mapInstance.getZoom());
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to fetch location: " + (error.message || "Unknown error"));
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Map click handler
  const handleMapClick = (e) => {
    setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    setManual(false);
    // You might want to reverse geocode here as well
    setForm(prevForm => ({ ...prevForm, address: "Fetching address..." })); // Placeholder
  };

  // Manual location change
  const handleManualChange = (e) => {
    setLocation({ ...location, [e.target.name]: parseFloat(e.target.value) });
    setManual(true);
    // Consider adding a button to manually update address from lat/lng if needed
  };

  // Form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const fallbackToFileDate = (file: File) => {
    const creationDateObj = new Date(file.lastModified);
    const currentDate = new Date();
    const diffDays = (currentDate - creationDateObj) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      alert("The uploaded image is more than 7 days old (based on file modified date).");
      throw "Image too old (fallback)";
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user_id = localStorage.getItem("user_id");
    const user_name = localStorage.getItem("username");

    console.log("Debugging: Retrieved user_id from localStorage:", user_id); // Debugging
    console.log("Debugging: Retrieved username from localStorage:", user_name); // Debugging

    if (!user_id || !user_name) {
      alert("You are submitting this report as an unauthenticated user. Your report will not be linked to an account.");
    }

    const evidenceUrls = [];
    if (files.length > 0) {
      try {
        for (const file of files) {
          // Extract metadata using exif-js
          await new Promise((resolve, reject) => {
            EXIF.getData(file, function () {
              const creationDate = EXIF.getTag(this, "DateTimeOriginal");
              if (!creationDate) {
                console.warn("No EXIF date, using file modified date...");
                try {
                  fallbackToFileDate(file);
                  return resolve();
                } catch (e) {
                  return reject(e);
                }
              } else {
                const creationDateObj = new Date(creationDate.replace(/:/g, "-").replace(" ", "T"));
                const currentDate = new Date();
                const diffDays = (currentDate - creationDateObj) / (1000 * 60 * 60 * 24);

                if (diffDays > 7) {
                  alert("The uploaded image is more than 7 days old. The report will be discarded.");
                  reject("Image too old");
                } else {
                  resolve();
                }
              }
            });
          });

          const { data, error } = await supabase.storage
            .from("evidence")
            .upload(`${Date.now()}_${file.name}`, file);

          if (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload evidence. Please try again.");
            return;
          }

          const { data: publicUrlData } = supabase
            .storage
            .from("evidence")
            .getPublicUrl(data.path);

          if (!publicUrlData || !publicUrlData.publicUrl) {
            console.error("Error getting public URL.");
            alert("Failed to get public URL.");
            return;
          }

          evidenceUrls.push(publicUrlData.publicUrl);
        }
      } catch (error) {
        console.error("Error processing image metadata:", error);
        return;
      }
    }

    // Ensure the payload matches the NormalReport model
    const crimeReportData = {
      user_id, // Retrieved from localStorage or null
      user_name, // Retrieved from localStorage or null
      category: form.category,
      description:form.description,
      latitude: location.lat,
      longitude: location.lng,
      evidence_files: evidenceUrls, // Optional field
    };

    console.log("Debugging: Payload being sent to backend:", crimeReportData); // Debugging

    try {
      const response = await fetch("http://localhost:8000/api/normal-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(crimeReportData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Crime report submitted successfully!");
      } else {
        alert(`Error: ${data.detail || "Failed to submit report"}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 min-h-screen">
      <div style={{ maxWidth: 800, margin: "40px auto", padding: 36, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", color: '#000', fontSize: '1.1rem' }}>
        <h2 style={{ color: '#000', fontSize: '2rem', marginBottom: 16 }}>Report a Crime</h2>
        <form onSubmit={handleSubmit} style={{ fontSize: '1.1rem' }}>
          {/* Crime Type */}
          <div style={{ marginBottom: 18 }}>

            <h3 style={{ color: '#223388', marginBottom: 8 }}>Crime Type</h3>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ width: '100%', marginBottom: 8, color: '#000' }}
              required
            >
              <option value="">Select issue Type</option>
              <option value="Roads">Roads</option>
              <option value="Lightning">Lightning</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Obstructions">Obstructions</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div style={{ marginTop: 16, color: '#000', marginBottom: 18 }}>
            <h3 style={{ color: '#223388', marginBottom: 8 }}>Incident Description</h3>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the incident in detail"
              rows={4}
              style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8, color: '#000' }}
              required
            />
          </div>



          {/* File Upload */}
          <div style={{ marginTop: 16, color: '#000', marginBottom: 18 }}>
            <h3 style={{ color: '#223388', marginBottom: 8 }}>Evidence Upload</h3>
            <b>Upload Files (images, videos, etc.):</b><br />
            <div {...getRootProps()} style={{ border: '2px dashed #888', padding: 20, borderRadius: 8, background: isDragActive ? '#e0e7ff' : '#f9f9f9', cursor: 'pointer', marginBottom: 8, color: '#000' }}>
              <input {...getInputProps()} />
              {isDragActive ? <p style={{ color: '#000' }}>Drop files here ...</p> : <p style={{ color: '#000' }}>Drag & drop files here, or click to select</p>}
              {files.length > 0 && <div style={{ marginTop: 8, color: '#000' }}>Selected: <b>{files.map(f => f.name).join(", ")}</b></div>}
            </div>
          </div>

          {/* Location Picker */}
          <div style={{ marginTop: 16, color: '#000', marginBottom: 18 }}>
            <h3 style={{ color: '#223388', marginBottom: 8 }}>Location</h3>
            <button type="button" onClick={fetchLocation} style={{ marginBottom: 8, color: '#000' }}>Use My Current Location</button>
            <div style={{ height: 300, marginBottom: 8 }}>
              {isClient && (
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={setMapInstance}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]} icon={markerIcon} />
                  <MapEventHandler onMapClick={handleMapClick} />
                </MapContainer>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#000' }}>
              <label style={{ color: '#000' }}>Lat: <input type="number" step="0.0001" name="lat" value={location.lat} onChange={handleManualChange} style={{ width: 110, color: '#000' }} readOnly /></label>
              <label style={{ color: '#000' }}>Lng: <input type="number" step="0.0001" name="lng" value={location.lng} onChange={handleManualChange} style={{ width: 110, color: '#000' }} readOnly /></label>
            </div>
            {/* Added readOnly to lat/lng inputs as they are controlled by map/geolocation */}
          </div>

          {/* Buttons */}
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button type="submit" style={{ background: '#223388', color: '#fff', border: 0, borderRadius: 4, padding: '8px 18px', fontWeight: 600 }}>Submit Crime Report</button>
            <button type="button" style={{ background: '#888', color: '#fff', border: 0, borderRadius: 4, padding: '8px 18px' }} onClick={() => window.history.back()}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
