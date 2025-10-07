"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Navbar />
          {children}
        </main>
      </div>
    </div>
  );
}


