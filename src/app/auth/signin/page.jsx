"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  const handleAdminDemo = async () => {
    setError("");
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("demo_admin", "1");
      }
    } catch (_) {}
    // Bypass auth entirely for demo and go straight to dashboard
    router.push("/dashboard");
  };

  const handleClientDemo = async () => {
    const demoEmail = process.env.NEXT_PUBLIC_DEMO_CLIENT_EMAIL;
    const demoPassword = process.env.NEXT_PUBLIC_DEMO_CLIENT_PASSWORD;
    if (!demoEmail || !demoPassword) {
      setError("Demo client credentials are not configured.");
      return;
    }
    setError("");
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("demo_admin");
      }
    } catch (_) {}
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });
    if (error) setError(error.message);
    else router.replace("/auth/signin");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white sm:bg-gray-50 ">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-500 text-white p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-briefcase-icon"
            >
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-2xl font-semibold mb-2 text-black">
          Welcome back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your ClientHub account
        </p>

        {/* Form */}
        <form onSubmit={handleSignin} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <div className="text-right text-sm mt-1">
              <a href="#" className="text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Sign up link */}
        <div className="text-center text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </div>

        {/* Quick demo access */}
        <div className="mt-6">
          <div className="text-center text-sm text-gray-500 mb-3">Quick demo access:</div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdminDemo}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 text-black"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={handleClientDemo}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 text-black"
            >
              Client Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
