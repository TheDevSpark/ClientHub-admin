"use client";

import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-20 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full md:max-w-md rounded-2xl border border-input bg-muted px-4 py-2 pl-9 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search..."
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="relative">
            <button className="text-foreground" title="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17h8l-2.586-2.586a2 2 0 00-2.828 0L4.828 17z" />
              </svg>
            </button>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">AD</span>
            <span className="hidden sm:block text-sm text-foreground">Admin User</span>
          </div>
        </div>
      </div>
    </div>
  );
}



