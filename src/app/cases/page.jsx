"use client";

import { useMemo, useState } from "react";

function StatusBadge({ status }) {
  const cls =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "In Progress"
      ? "bg-indigo-50 text-indigo-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function CasesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const cases = useMemo(
    () => [
      { id: "#0001", client: "Sarah Johnson", type: "Contract Review", status: "In Progress", created: "9/15/2024", updated: "10/3/2024" },
      { id: "#0002", client: "Sarah Johnson", type: "Property Dispute", status: "Completed", created: "8/10/2024", updated: "9/28/2024" },
      { id: "#0003", client: "Michael Chen", type: "Business Formation", status: "Pending", created: "9/28/2024", updated: "10/1/2024" },
      { id: "#0004", client: "Emily Rodriguez", type: "Estate Planning", status: "In Progress", created: "9/5/2024", updated: "10/2/2024" },
      { id: "#0005", client: "Emily Rodriguez", type: "Immigration Consultation", status: "Completed", created: "8/20/2024", updated: "9/15/2024" },
      { id: "#0006", client: "James Wilson", type: "Divorce Proceedings", status: "In Progress", created: "9/10/2024", updated: "10/4/2024" },
      { id: "#0007", client: "Amanda Park", type: "Trademark Registration", status: "Completed", created: "7/15/2024", updated: "9/30/2024" },
    ],
    []
  );

  const filtered = cases.filter((c) => {
    const q = query.toLowerCase();
    const matchesQuery =
      c.id.toLowerCase().includes(q) ||
      c.client.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" ? true : c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1">
          {/* Navbar is global via AppShell */}

          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-foreground">Cases</h1>
              <p className="text-sm text-muted-foreground">Manage and track all client cases</p>
            </div>

            <div className="bg-card border border-border rounded-xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-4 border-b border-border">
                <div>
                  <div className="text-sm font-medium text-card-foreground">All Cases</div>
                  <div className="text-xs text-muted-foreground">{filtered.length} cases found</div>
                </div>
                <div className="flex items-center gap-2">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-64 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Search cases..." />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
                    <option>All</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                  <button className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">New Case</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Case ID</th>
                      <th className="px-5 py-3 text-left font-medium">Client</th>
                      <th className="px-5 py-3 text-left font-medium">Case Type</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left font-medium">Created</th>
                      <th className="px-5 py-3 text-left font-medium">Last Updated</th>
                      <th className="px-5 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((c, idx) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="px-5 py-3 text-foreground">{c.id}</td>
                        <td className="px-5 py-3 text-foreground">{c.client}</td>
                        <td className="px-5 py-3 text-muted-foreground">{c.type}</td>
                        <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-3 text-muted-foreground">{c.created}</td>
                        <td className="px-5 py-3 text-muted-foreground">{c.updated}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-4">
                            <button className="text-primary hover:underline">View</button>
                            <button className="text-primary hover:underline">Edit</button>
                          </div>
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


