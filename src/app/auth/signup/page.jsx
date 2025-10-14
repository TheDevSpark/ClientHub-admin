"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Creating your account...");

    // 1️⃣ Create user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/signin`,
        data: {
          full_name: name,
          phone_number: phone,
        },
      },
    });

    if (signUpError) {
      toast.dismiss(toastId);
      toast.error(signUpError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Insert profile record if user was created successfully
    const user = data?.user;
    if (user) {
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: name,
          phone_number: phone,
          role: "admin",
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Error inserting profile:", insertError.message);
        toast.dismiss(toastId);
        toast.error("Failed to save profile details.");
        setLoading(false);
        return;
      }
    }

    // 3️⃣ Reset form + show success toast
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    toast.dismiss(toastId);
    toast.success(
      "✅ Sign up successful! Check your email to verify your account."
    );

    setLoading(false);
    setTimeout(() => router.push("/auth/signin"), 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
      <Toaster position="top-center" />
      <div className="bg-white shadow-xl border border-gray-100 rounded-2xl p-8 w-full max-w-sm transform transition duration-300 hover:shadow-2xl">
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

        <h2 className="text-center text-2xl font-bold mb-2 text-gray-900">
          Create Admin Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign up to access your admin dashboard
        </p>

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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
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
              placeholder="+92 XXX XXXX"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
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
