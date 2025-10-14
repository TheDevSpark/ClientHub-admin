"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // adjust the path if needed

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (user === undefined) return; // still loading context

    if (user) {
      // logged in — redirect to dashboard if accessing signin/signup
      if (pathname === "/signin" || pathname === "/signup") {
        router.replace("/dashboard");
      }
    } else {
      // not logged in — redirect to signin if on a protected page
      if (pathname !== "/signin" && pathname !== "/signup") {
        router.replace("/auth/signin");
      }
    }
  }, [user, pathname, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-gray-500">Redirecting...</div>
    </main>
  );
}
