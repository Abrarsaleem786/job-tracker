"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Company } from "@/types";
import { CompanyRow } from "./CompanyRow";

type SortKey = "name" | "category" | "location" | "status" | "dateApplied";

type Props = {
  companies: Company[];
  sort: SortKey;
  order: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
};

function SortIcon({
  active,
  order,
}: {
  active: boolean;
  order: "asc" | "desc";
}) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
  return order === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
  );
}

export function CompanyTable({
  companies,
  sort,
  order,
  onSort,
  onStatusChange,
  onDelete,
}: Props) {
  const headers: { key: SortKey; label: string; className?: string }[] = [
    { key: "name", label: "Company" },
    { key: "category", label: "Category", className: "hidden lg:table-cell" },
    { key: "location", label: "Location", className: "hidden md:table-cell" },
    { key: "status", label: "Status" },
    { key: "dateApplied", label: "Applied", className: "hidden sm:table-cell" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((h) => (
                <th key={h.key} className={`px-4 py-3 ${h.className ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => onSort(h.key)}
                    className="inline-flex items-center gap-1 hover:text-slate-800"
                  >
                    {h.label}
                    <SortIcon active={sort === h.key} order={order} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  No companies match your filters.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <CompanyRow
                  key={c.id}
                  company={c}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
        {companies.length} compan{companies.length === 1 ? "y" : "ies"}
      </div>
    </div>
  );
}
