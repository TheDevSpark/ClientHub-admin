"use client";

import { useMemo, useState } from "react";

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center">
      {initials}
    </div>
  );
}

export default function ClientsPage() {
  const [query, setQuery] = useState("");

  const clients = useMemo(
    () => [
      { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(555) 123-4567", cases: 3, joined: "1/15/2024" },
      { name: "Michael Chen", email: "michael.c@email.com", phone: "(555) 234-5678", cases: 1, joined: "2/20/2024" },
      { name: "Emily Rodriguez", email: "emily.r@email.com", phone: "(555) 345-6789", cases: 2, joined: "3/10/2024" },
      { name: "James Wilson", email: "james.w@email.com", phone: "(555) 456-7890", cases: 1, joined: "3/25/2024" },
      { name: "Amanda Park", email: "amanda.p@email.com", phone: "(555) 567-8901", cases: 4, joined: "2/5/2024" },
    ],
    []
  );

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1">
          {/* Navbar is global via AppShell */}

          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
              <p className="text-sm text-gray-500">Manage your client relationships and information</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 py-4 border-b border-gray-200">
                <div>
                  <div className="text-sm font-medium text-gray-800">All Clients</div>
                  <div className="text-xs text-gray-500">{filtered.length} total clients</div>
                </div>
                <div className="flex items-center gap-2">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search clients..." />
                  <button className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add Client</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Client</th>
                      <th className="px-5 py-3 text-left font-medium">Email</th>
                      <th className="px-5 py-3 text-left font-medium">Phone</th>
                      <th className="px-5 py-3 text-left font-medium">Total Cases</th>
                      <th className="px-5 py-3 text-left font-medium">Joined Date</th>
                      <th className="px-5 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((c, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} />
                            <span className="text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          <span className="inline-flex items-center gap-2">
                            <span>✉️</span>
                            {c.email}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          <span className="inline-flex items-center gap-2">
                            <span>📞</span>
                            {c.phone}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{c.cases}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{c.joined}</td>
                        <td className="px-5 py-3">
                          <button className="text-indigo-600 hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


