"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAuthRoute = useMemo(() => pathname?.startsWith("/auth"), [pathname]);

  if (isAuthRoute) {
    return <div className="min-h-screen bg-white">{children}</div>;
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
