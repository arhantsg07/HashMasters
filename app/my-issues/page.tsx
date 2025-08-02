"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../auth";
import { Eye, MapPin, Clock, Users, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Adapted to match public.reports schema
interface Report {
  id: string;
  user_id?: string;
  user_name?: string;
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  evidence_files?: string[];
  created_at?: string;
}

const categoryConfig = {
  road_damage: { label: "Road Damage" },
  garbage: { label: "Garbage" },
  water_leak: { label: "Water Leak" }
  // Add more if needed
};

export default function MyIssuesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setReports([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });
      if (error) {
        setReports([]);
      } else {
        setReports(data as Report[]);
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 px-2 py-4 md:px-4 md:py-8 font-sans">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-semibold transition-colors">
          <ArrowLeft size={22} />
          <span className="text-base md:text-lg">Back</span>
        </Link>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-10 text-center text-indigo-900 drop-shadow-lg tracking-tight">My Reported Issues</h1>
      {loading ? (
        <div className="text-center py-12 text-lg text-indigo-500 font-medium">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-lg text-indigo-400 font-medium">No issues reported yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-indigo-100 hover:border-indigo-300"
              onClick={() => setSelectedReport(report)}
            >
              <div className="p-5 md:p-7 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shadow">
                    {categoryConfig[report.category]?.label || report.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 shadow">
                    {report.user_name}
                  </span>
                </div>
                <h3 className="font-bold text-lg md:text-xl text-indigo-900 mb-2">{report.category}</h3>
                <p className="text-gray-700 mb-3 line-clamp-2 font-medium">{report.description}</p>
                <div className="flex items-center text-indigo-500 text-sm mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span>
                    Lat: {report.latitude}, Lng: {report.longitude}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-indigo-400 mt-auto">
                  <div />
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatTimeAgo(report.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for report details */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred background */}
          <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md transition-all"></div>
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-2 md:mx-0 p-0 flex flex-col border border-indigo-200 z-10">
            <button
              className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-700 z-20"
              onClick={() => setSelectedReport(null)}
            >
              <X size={28} />
            </button>
            <div className="p-8 overflow-y-auto max-h-[80vh]">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-indigo-700 text-center drop-shadow">
                {categoryConfig[selectedReport.category]?.label || selectedReport.category}
              </h2>
              <div className="mb-4 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 shadow">
                  {selectedReport.user_name}
                </span>
                {/* Location clickable */}
                <button
                  className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 shadow hover:bg-indigo-200 hover:text-indigo-900 transition-colors"
                  onClick={() => window.open(`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`, "_blank")}
                  title="View on map"
                >
                  Lat: {selectedReport.latitude}, Lng: {selectedReport.longitude}
                </button>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-600 shadow">
                  {formatTimeAgo(selectedReport.created_at)}
                </span>
              </div>
              <p className="text-gray-800 mb-6 text-lg text-center font-medium">{selectedReport.description}</p>
              {selectedReport.evidence_files && selectedReport.evidence_files.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold mb-2 text-indigo-700 text-center">Evidence Files:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedReport.evidence_files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-indigo-50 rounded-lg p-2 text-indigo-700 font-medium hover:underline truncate shadow"
                      >
                        {file.match(/\w+\.\w+$/)?.[0] || `File ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}