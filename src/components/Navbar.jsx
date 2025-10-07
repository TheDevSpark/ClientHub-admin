"use client";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              className="w-full md:max-w-md rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 pl-9 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search..."
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-700" title="Theme">↺</button>
          <div className="relative">
            <button className="text-gray-700" title="Notifications">🔔</button>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">AD</span>
            <span className="hidden sm:block text-sm text-gray-700">Admin User</span>
          </div>
        </div>
      </div>
    </div>
  );
}



