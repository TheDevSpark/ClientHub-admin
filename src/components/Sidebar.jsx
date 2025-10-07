"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/clients", label: "Clients", icon: "👥" },
  { href: "/cases", label: "Cases", icon: "🧰" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-56 lg:w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:sticky md:top-0 md:h-screen">
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-lg font-semibold text-black"><span>🧳</span> ClientHub</div>
      </div>
      <nav className="p-3 space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 border-t border-gray-200">
        <Link href="/auth/signin" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <span>↩️</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}



