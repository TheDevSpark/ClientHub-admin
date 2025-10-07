"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function decideLanding() {
      const { data } = await supabase.auth.getSession();
      const session = data?.session || null;
      if (!session) {
        router.replace("/auth/signup");
        return;
      }
      const user = session.user;
      const role =
        (user?.user_metadata && user.user_metadata.role) ||
        (user?.app_metadata && user.app_metadata.role) ||
        null;
      if (role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/auth/signin");
      }
    }
    decideLanding();
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-gray-500">Redirecting...</div>
    </main>
  );
}
