"use client";
import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

const Sidebar = () => {
  const logout = () => {
    localStorage.removeItem("admin_logged_in");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold">CivicTrack Admin</h2>
      <nav className="space-y-3">
        <Link href="/admin-dashboard" className="block hover:text-cyan-300">
          Dashboard
        </Link>
        <button
          onClick={logout}
          className="flex items-center space-x-2 mt-10 text-red-400 hover:text-red-500"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
