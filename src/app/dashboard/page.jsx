"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function StatCard({ title, value, delta, icon }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {delta && <div className="text-xs text-emerald-600 mt-1">{delta}</div>}
      </div>
    </div>
  );
}

function RecentSubmissionsTable({ rows }) {
  return (
    <div className="bg-card rounded-xl border border-border w-[70%] ">
      <div className="px-5 py-4 border-b border-border">
        <div className="text-sm font-medium text-card-foreground">
          Recent Submissions
        </div>
        <div className="text-xs text-muted-foreground">
          Latest case updates and new submissions
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Client</th>
              <th className="px-5 py-3 text-left font-medium">Case Type</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Last Updated</th>
              <th className="px-5 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-muted/50">
                <td className="px-5 py-3 text-foreground">{r.client}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {r.caseType}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : r.status === "In Progress"
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.updated}</td>
                <td className="px-5 py-3">
                  <button className="text-primary hover:underline flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityItem({ title, subtitle, date }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-sm text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
        <div className="text-xs text-muted-foreground/70 mt-1">{date}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState([]);
  const [rows, setRows] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      const profilesPromise = supabase.from("profiles").select("id, full_name");
      const casesPromise = supabase
        .from("cases")
        .select('id, created_at, "case-type", status, "case-id"')
        .order("created_at", { ascending: false })
        .limit(20);
      const [{ data: profiles, error: pErr }, { data: cases, error: cErr }] =
        await Promise.all([profilesPromise, casesPromise]);
      if (!isMounted) return;
      if (pErr || cErr) {
        setError((pErr || cErr)?.message || "Failed to load dashboard");
        setLoading(false);
        return;
      }
      const idToName = new Map(
        (profiles || []).map((p) => [p.id, p.full_name])
      );
      const activeCount = (cases || []).filter(
        (c) => c.status === "In Progress"
      ).length;
      const completedCount = (cases || []).filter(
        (c) => c.status === "Completed"
      ).length;
      const uniqueClients = new Set(
        (cases || []).map((c) => c["case-id"]).filter(Boolean)
      ).size;

      setStats([
        {
          title: "Active Cases",
          value: activeCount,
          delta: "",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
              />
              <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>
          ),
        },
        {
          title: "Completed Cases",
          value: completedCount,
          delta: "",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          title: "Active Clients",
          value: uniqueClients,
          delta: "",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          ),
        },
      ]);

      setRows(
        (cases || []).slice(0, 5).map((c) => ({
          client: idToName.get(c["case-id"]) || "Unknown",
          caseType: c["case-type"] || "",
          status: c.status || "",
          updated: c.created_at
            ? new Date(c.created_at).toLocaleDateString()
            : "",
        }))
      );

      setActivities(
        (cases || []).slice(0, 4).map((c) => ({
          title: `${c.status || "Updated"} • ${c["case-type"] || "Case"}`,
          subtitle: idToName.get(c["case-id"]) || "",
          date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
        }))
      );

      setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main */}
        <main className="flex-1">
          {/* Navbar is global via AppShell */}

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-foreground">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Here's what's happening today.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {(loading ? [1, 2, 3] : stats).map((s, i) => (
                <StatCard
                  key={i}
                  title={s.title || "—"}
                  value={s.value ?? "—"}
                  delta={s.delta}
                  icon={s.icon}
                />
              ))}
            </div>

            {/* Recent Submissions */}
            <RecentSubmissionsTable rows={rows} />

            {/* Recent Activity */}
            <div className="mt-6 bg-card rounded-xl border border-border p-5">
              <div className="text-sm font-medium text-card-foreground mb-1">
                Recent Activity
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Latest updates across all cases
              </div>
              <div className="grid gap-5">
                {activities.map((a, i) => (
                  <ActivityItem
                    key={i}
                    title={a.title}
                    subtitle={a.subtitle}
                    date={a.date}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
