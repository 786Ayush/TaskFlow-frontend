"use client";

import api from "@/utils/axios";
import Link from "next/link";
import React, { useState, JSX } from "react";
import { toast } from "react-toastify";

type LoginForm = {
  email: string;
  password: string;
};

export default function Login(): JSX.Element {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Handle Input Change Safely
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation Function
  const validate = (): boolean => {
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!form.password.trim()) {
      toast.error("Password is required");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    let toastId: any;

    try {
      setLoading(true);

      // Show loading toast
      toastId = toast.loading("Logging in...");

      const response = await api.post("/auth/login", form);

      // Update toast to success
      toast.update(toastId, {
        render: "Login successful 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Optional: redirect after short delay
      
        window.location.href = "/";
      
    } catch (err: any) {
      // console.error("Login error:", err);

      const message =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";

      // Update toast to error
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/40">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an Account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
