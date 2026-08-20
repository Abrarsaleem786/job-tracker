"use client";

import type { ReactNode } from "react";
import { Filter, MapPin, Search, Tags, X } from "lucide-react";
import { STATUSES, STATUS_LABELS } from "@/types";

export type Filters = {
  q: string;
  status: string;
  category: string;
  location: string;
};

type Props = {
  filters: Filters;
  categories: string[];
  locations: string[];
  onChange: (next: Filters) => void;
  actions?: ReactNode;
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none ring-blue-500 transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2";

export function FilterBar({
  filters,
  categories,
  locations,
  onChange,
  actions,
}: Props) {
  const activeCount = [
    filters.q,
    filters.status,
    filters.category,
    filters.location,
  ].filter(Boolean).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2 text-white shadow-sm shadow-blue-600/25">
            <Filter className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Search &amp; filters
            </h2>
            <p className="text-xs text-slate-500">
              Narrow your application pipeline
            </p>
          </div>
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange({ q: "", status: "", category: "", location: "" })
              }
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
          {actions}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:col-span-2 xl:col-span-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => onChange({ ...filters, q: e.target.value })}
              placeholder="Name, position, notes…"
              className={`${fieldClass} pl-9`}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className={fieldClass}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <Tags className="h-3.5 w-3.5" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value })
            }
            className={fieldClass}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) =>
              onChange({ ...filters, location: e.target.value })
            }
            className={fieldClass}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
