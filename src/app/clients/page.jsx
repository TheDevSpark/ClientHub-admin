"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");

      // Step 1: Fetch all client profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, role, phone_number, created_at")
        .eq("role", "client");

      if (pErr) {
        setError(pErr?.message || "Failed to load clients");
        setLoading(false);
        return;
      }

      // Step 2: Fetch all cases (we’ll group manually)
      const { data: cases, error: cErr } = await supabase
        .from("cases")
        .select("user_id");

      if (cErr) {
        console.error(cErr);
      }

      // Step 3: Count how many cases per user_id
      const counts = new Map();
      (cases || []).forEach((c) => {
        counts.set(c.user_id, (counts.get(c.user_id) || 0) + 1);
      });

      // Step 4: Merge with client data
      const normalized = (profiles || []).map((p) => ({
        id: p.id,
        name: p.full_name || "Unnamed",
        email: "",
        phone: p.phone_number || "",
        role: p.role || "",
        cases: counts.get(p.id) || 0,
        joined: p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
      }));

      if (isMounted) {
        setClients(normalized);
        setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1">
          {/* Navbar is global via AppShell */}

          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-foreground">Clients</h1>
              <p className="text-sm text-muted-foreground">
                Manage your client relationships and information
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 py-4 border-b border-border">
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    All Clients
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filtered.length} total clients
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-64 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Search clients..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">
                        Client
                      </th>
                      <th className="px-5 py-3 text-left font-medium">Phone</th>
                      <th className="px-5 py-3 text-left font-medium">
                        Total Cases
                      </th>
                      <th className="px-5 py-3 text-left font-medium">
                        Joined Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td
                          className="px-5 py-6 text-muted-foreground"
                          colSpan={6}
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td className="px-5 py-6 text-red-600" colSpan={6}>
                          {error}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/50">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.name} />
                              <span className="text-foreground">{c.name}</span>
                            </div>
                          </td>

                          <td className="px-5 py-3 text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                              <span>📞</span>
                              {c.phone}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              {c.cases}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {c.joined || "—"}
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
