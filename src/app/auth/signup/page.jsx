"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation"; // Temporarily commented out to fix compilation error

// --- START: Mock Supabase Client for Compilation ---
// IMPORTANT: Replace this block with your actual Supabase import:
// import { supabase } from "@/utils/supabaseClient";
const supabase = {
  auth: {
    signUp: async ({ email, password, options }) => {
      console.log("--- MOCK SUPABASE SIGNUP ATTEMPT ---");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password ? "********" : "N/A"}`);
      console.log(
        "User Metadata (Used by DB Trigger for profiles table):",
        options.data
      );

      // Simulate success after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { data: { user: { id: "mock-user-123" } }, error: null };
    },
  },
};
// --- END: Mock Supabase Client for Compilation ---

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // const router = useRouter(); // Temporarily commented out
  // Mock router for successful compilation
  const router = {
    push: (path) => console.log(`[MOCK ROUTER] Pushing to: ${path}`),
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // 1. Send the sign-up request to Supabase.
    // NOTE ON ROLE: The role management (addup) is handled by a PostgreSQL
    // trigger in Supabase, which automatically assigns a default role ('client')
    // when a new user is created in the auth.users table.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This sets the URL to redirect to after successful email verification.
        emailRedirectTo: `${
          typeof window !== "undefined" ? location.origin : "http://localhost"
        }/auth/signin`,
        // This metadata is passed to the database where the trigger can read it
        // to populate the 'profiles' table with the new user's name/phone.
        data: {
          full_name: name,
          phone_number: phone,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "✅ Sign up successful! Please check your email inbox to verify your account before signing in."
      );
      // Optionally clear form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 w-full max-w-sm transform transition duration-300 hover:shadow-2xl">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 text-white p-4 rounded-full shadow-lg">
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
        <h2 className="text-center text-2xl font-bold mb-2 text-gray-900">
          Create Client Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign up to your dedicated ClientHub account
        </p>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900 transition bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+92 300 1234567"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900 transition bg-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900 transition bg-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Messages */}
        {error && (
          <p className="bg-red-50 text-red-700 text-sm mt-6 p-3 rounded-xl border border-red-200">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-green-50 text-green-700 text-sm mt-6 p-3 rounded-xl border border-green-200">
            {message}
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
