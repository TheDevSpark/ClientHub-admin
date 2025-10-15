"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// No status badge needed for current schema

export default function CasesPage() {
  const [query, setQuery] = useState("");
  // Status filter removed as current schema has no status field
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cases, setCases] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      // Fetch all cases using actual columns from your schema
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("case_id, created_at, name, description, type, status")
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (casesError) {
        setError(casesError?.message || "Failed to load cases");
        setLoading(false);
        return;
      }
      const normalized = (casesData || []).map((c) => ({
        id: c.case_id,
        name: c.name || "",
        description: c.description || "",
        type: c.type || "",
        status: c.status || "",
        created: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
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
    const nameStr = String(c.name || "").toLowerCase();
    const descStr = String(c.description || "").toLowerCase();
    return idStr.includes(q) || nameStr.includes(q) || descStr.includes(q);
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
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">
                        Case ID
                      </th>
                      <th className="px-5 py-3 text-left font-medium">Name</th>
                      <th className="px-5 py-3 text-left font-medium">Description</th>
                      <th className="px-5 py-3 text-left font-medium">Type</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left font-medium">
                        Created
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
                          <td className="px-5 py-3 text-foreground">{c.name}</td>
                          <td className="px-5 py-3 text-muted-foreground">{c.description}</td>
                          <td className="px-5 py-3 text-muted-foreground">{c.type}</td>
                          <td className="px-5 py-3 text-muted-foreground">{c.status}</td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.created}
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
