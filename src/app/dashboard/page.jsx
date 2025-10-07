"use client";

import { useMemo } from "react";

function StatCard({ title, value, delta, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {delta && <div className="text-xs text-emerald-600 mt-1">{delta}</div>}
      </div>
    </div>
  );
}

function RecentSubmissionsTable({ rows }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700">Recent Submissions</div>
        <div className="text-xs text-gray-500">Latest case updates and new submissions</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Client</th>
              <th className="px-5 py-3 text-left font-medium">Case Type</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Last Updated</th>
              <th className="px-5 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-900">{r.client}</td>
                <td className="px-5 py-3 text-gray-700">{r.caseType}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : r.status === "In Progress"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{r.updated}</td>
                <td className="px-5 py-3">
                  <button className="text-indigo-600 hover:underline flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
      <div className="mt-1 h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
        <div className="text-xs text-gray-400 mt-1">{date}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats = useMemo(
    () => [
      { 
        title: "Active Cases", 
        value: 3, 
        delta: "+ 3 from last week", 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
          </svg>
        )
      },
      { 
        title: "Completed Cases", 
        value: 3, 
        delta: "+ 2 this month", 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      { 
        title: "New Clients", 
        value: 2, 
        delta: "This month", 
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        )
      },
    ],
    []
  );

  const rows = useMemo(
    () => [
      { client: "Sarah Johnson", caseType: "Contract Review", status: "In Progress", updated: "10/3/2024" },
      { client: "Sarah Johnson", caseType: "Property Dispute", status: "Completed", updated: "9/28/2024" },
      { client: "Michael Chen", caseType: "Business Formation", status: "Pending", updated: "10/1/2024" },
      { client: "Emily Rodriguez", caseType: "Estate Planning", status: "In Progress", updated: "10/2/2024" },
      { client: "Emily Rodriguez", caseType: "Immigration Consultation", status: "Completed", updated: "9/15/2024" },
    ],
    []
  );

  const activities = useMemo(
    () => [
      { title: "Review in progress • Contract Review", subtitle: "Legal team reviewing contract terms", date: "10/3/2024" },
      { title: "Case resolved • Property Dispute", subtitle: "Settlement agreement reached", date: "9/28/2024" },
      { title: "Case opened • Business Formation", subtitle: "Awaiting initial documentation", date: "9/28/2024" },
      { title: "Client review • Estate Planning", subtitle: "", date: "9/25/2024" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main */}
        <main className="flex-1">
          {/* Navbar is global via AppShell */}

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {stats.map((s, i) => (
                <StatCard key={i} title={s.title} value={s.value} delta={s.delta} icon={s.icon} />
              ))}
            </div>

            {/* Recent Submissions */}
            <RecentSubmissionsTable rows={rows} />

            {/* Recent Activity */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-sm font-medium text-gray-700 mb-1">Recent Activity</div>
              <div className="text-xs text-gray-500 mb-4">Latest updates across all cases</div>
              <div className="grid gap-5">
                {activities.map((a, i) => (
                  <ActivityItem key={i} title={a.title} subtitle={a.subtitle} date={a.date} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


