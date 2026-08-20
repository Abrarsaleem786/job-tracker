"use client";

import {
  Briefcase,
  Send,
  CalendarClock,
  Gift,
  XCircle,
  Percent,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardStats as Stats } from "@/types";
import { STATUS_LABELS, type Status } from "@/types";

const CARD_STYLES = [
  {
    key: "total",
    label: "Total",
    icon: Briefcase,
    accent: "text-slate-700 bg-slate-100",
    ring: "from-slate-200/80",
  },
  {
    key: "applied",
    label: "Applied",
    icon: Send,
    accent: "text-blue-700 bg-blue-100",
    ring: "from-blue-200/80",
  },
  {
    key: "interviewing",
    label: "Interviewing",
    icon: CalendarClock,
    accent: "text-amber-700 bg-amber-100",
    ring: "from-amber-200/80",
  },
  {
    key: "offers",
    label: "Offers",
    icon: Gift,
    accent: "text-emerald-700 bg-emerald-100",
    ring: "from-emerald-200/80",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    accent: "text-red-700 bg-red-100",
    ring: "from-red-200/80",
  },
  {
    key: "responseRate",
    label: "Response rate",
    icon: Percent,
    accent: "text-violet-700 bg-violet-100",
    ring: "from-violet-200/80",
  },
] as const;

const CHART_COLORS: Record<string, string> = {
  not_applied: "#94a3b8",
  researching: "#8b5cf6",
  applied: "#3b82f6",
  interview_scheduled: "#f59e0b",
  interviewed: "#f97316",
  offer: "#10b981",
  rejected: "#ef4444",
  withdrawn: "#6b7280",
};

type Props = { stats: Stats };

export function DashboardStats({ stats }: Props) {
  const values: Record<string, number | string> = {
    total: stats.total,
    applied: stats.applied,
    interviewing: stats.interviewing,
    offers: stats.offers,
    rejected: stats.rejected,
    responseRate: `${stats.responseRate}%`,
  };

  const chartData = stats.byStatus
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: STATUS_LABELS[s.status as Status] ?? s.status,
      value: s.count,
      status: s.status,
    }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CARD_STYLES.map(({ key, label, icon: Icon, accent, ring }) => (
          <div
            key={key}
            className={`rounded-2xl border border-white/80 bg-gradient-to-br ${ring} via-white to-white p-4 shadow-sm shadow-slate-200/60`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {label}
              </p>
              <span className={`rounded-lg p-1.5 ${accent}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {values[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-200/50 backdrop-blur">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Status breakdown
        </h2>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            No companies yet
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={CHART_COLORS[entry.status] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
