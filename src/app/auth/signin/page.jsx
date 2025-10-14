"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function SigninPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const REQUIRED_ROLE = "admin";

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    // 1️⃣ Sign in user
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      toast.error(signInError.message);
      setLoading(false);
      return;
    }

    const user = signInData?.user;
    if (!user) {
      toast.error("Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    // 2️⃣ Fetch user profile to check role
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      toast.error(`Could not fetch user profile: ${error.message}`);
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // 3️⃣ Check role and redirect
    if (data) {
      console.log(user);
      toast.success("Welcome back!");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      console.log(data);
      toast.error("Access denied — only admins can log in.");
      // await supabase.auth.signOut();
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
      <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 text-white p-4 rounded-full shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

        <h2 className="text-center text-2xl font-bold mb-2 text-gray-900">
          Welcome back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your ClientHub account
        </p>

        <form onSubmit={handleSignin} className="space-y-4">
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900 transition bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900 transition bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right text-sm mt-1">
              <a href="#" className="text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
