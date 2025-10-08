"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isAuthRoute = useMemo(() => pathname?.startsWith("/auth"), [pathname]);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      if (isAuthRoute) {
        if (isMounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
        return;
      }

      // Allow admin demo to bypass auth checks
      try {
        const demoBypass =
          typeof window !== "undefined" &&
          window.localStorage.getItem("demo_admin") === "1";
        if (demoBypass) {
          if (isMounted) {
            setIsAuthorized(true);
            setIsChecking(false);
          }
          return;
        }
      } catch (_) {}

      const { data, error } = await supabase.auth.getSession();
      const session = data?.session || null;

      if (!session) {
        router.replace("/auth/signup");
        if (isMounted) setIsChecking(false);
        return;
      }

      const user = session.user;
      const role =
        (user?.user_metadata && user.user_metadata.role) ||
        (user?.app_metadata && user.app_metadata.role) ||
        null;

      if (role === "admin") {
        if (isMounted) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } else {
        router.replace("/auth/signin");
        if (isMounted) setIsChecking(false);
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [isAuthRoute, router]);

  if (isAuthRoute) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          <Navbar />
          {children}
        </main>
      </div>
    </div>
  );
}
