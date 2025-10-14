"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function StatusBadge({ status }) {
  const cls =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "In Progress"
      ? "bg-indigo-50 text-indigo-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

export default function CasesPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cases, setCases] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      // Fetch profiles to map client names
      const profilesPromise = supabase.from("profiles").select("id, full_name");
      // Fetch cases
      const casesPromise = supabase
        .from("cases")
        .select(
          'id, created_at, "case-name", "case-description", "case-type", status, "case-id"'
        )
        .order("created_at", { ascending: false });

      const [
        { data: profilesData, error: profilesError },
        { data: casesData, error: casesError },
      ] = await Promise.all([profilesPromise, casesPromise]);

      if (!isMounted) return;
      if (profilesError || casesError) {
        setError(
          (profilesError || casesError)?.message || "Failed to load cases"
        );
        setLoading(false);
        return;
      }

      const idToName = new Map(
        (profilesData || []).map((p) => [p.id, p.full_name])
      );
      const normalized = (casesData || []).map((c) => ({
        id: c.id,
        client: idToName.get(c["case-id"]) || "Unknown",
        type: c["case-type"] || "",
        status: c.status || "",
        created: c.created_at
          ? new Date(c.created_at).toLocaleDateString()
          : "",
        updated: c.created_at
          ? new Date(c.created_at).toLocaleDateString()
          : "",
      }));
      setCases(normalized);
      setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = cases.filter((c) => {
    const q = query.toLowerCase();
    const idStr = String(c.id || "").toLowerCase();
    const clientStr = String(c.client || "").toLowerCase();
    const typeStr = String(c.type || "").toLowerCase();
    const matchesQuery =
      idStr.includes(q) || clientStr.includes(q) || typeStr.includes(q);
    const matchesStatus =
      statusFilter === "All" ? true : c.status === statusFilter;
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
              <p className="text-sm text-muted-foreground">
                Manage and track all client cases
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-5 py-4 border-b border-border">
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    All Cases
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filtered.length} cases found
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-64 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Search cases..."
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    <option>All</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                  <button className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    New Case
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">
                        Case ID
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Client
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Case Type
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Created
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Last Updated
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td
                          className="px-5 py-6 text-muted-foreground"
                          colSpan={7}
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td className="px-5 py-6 text-red-600" colSpan={7}>
                          {error}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/50">
                          <td className="px-5 py-3 text-foreground">
                            #{String(c.id).padStart(4, "0")}
                          </td>
                          <td className="px-5 py-3 text-foreground">
                            {c.client}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.type}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.created}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.updated}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-4">
                              <button className="text-primary hover:underline">
                                View
                              </button>
                              <button className="text-primary hover:underline">
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
