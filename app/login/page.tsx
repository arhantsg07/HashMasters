"use client";
import React, { useState } from 'react';
import { ChevronRight, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { House } from 'lucide-react';

const LoginPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Save user_id and username in localStorage
                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("username", data.username);

                console.log("Debugging: Stored user_id:", data.user_id); // Debugging
                console.log("Debugging: Stored username:", data.username); // Debugging

                alert('Login successful!');

                console.log('Response:', data);
                const userData = {
                    username: data.username,
                    isLoggedIn: true
                };

                localStorage.setItem('user', JSON.stringify(userData));
                document.cookie = "auth-token=true; path=/;";
            
                
                router.push("/");
                // Optionally redirect or clear form
            } else {
                alert(`Login failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error during Login:', error);
            alert('Something went wrong. Please try again later.');
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


            {/* Login */}

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:border-blue-500/30 transition-all duration-500 hover:shadow-blue-500/10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mb-4 shadow-lg">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-400">Sign in to access your account</p>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Username Field */}
                            <div>
                                <label className="block text-white text-sm font-semibold mb-2" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Password Field */}
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
                                        placeholder="Enter your password"
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

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-300">
                                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                                    Remember me
                                </label>
                                <a href="/forgot-password" className="text-blue-400 hover:text-white transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="group w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
                            >
                                <span className="flex items-center justify-center">
                                    Sign In
                                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-6 pt-6 border-t border-white/10">
                        <p className="text-gray-400">
                            Dont have an account?{' '}
                            <a href="/register" className="text-blue-400 hover:text-white font-semibold transition-colors">
                                Sign up here
                            </a>
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default LoginPage;