"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, User, Eye, EyeOff, House } from "lucide-react";

interface FormData {
  username: string;
  password: string;
}

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const hardcodedAdmin = {
      username: "admin",
      password: "admin123",
    };

    if (
      formData.username === hardcodedAdmin.username &&
      formData.password === hardcodedAdmin.password
    ) {
      alert("Admin login successful!");
      localStorage.setItem("admin_logged_in", "true");
      router.push("/admin-dashboard");
    } else {
      alert("Invalid admin credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center space-x-2 text-white hover:text-cyan-300 transition-colors"
        >
          <House />
          <span className="font-medium">Home</span>
        </Link>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:border-blue-500/30 transition-all duration-500 hover:shadow-blue-500/10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mb-4 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-gray-400">Only authorized users can proceed</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-semibold mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300 pr-12"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="group w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
              >
                <span className="flex items-center justify-center">
                  Sign In
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
