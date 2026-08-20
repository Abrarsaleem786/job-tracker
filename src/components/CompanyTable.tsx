"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from "lucide-react";
import type { Company } from "@/types";
import { CompanyRow } from "./CompanyRow";
import { useConfirm } from "./ConfirmDialog";
import { Spinner } from "./Spinner";

type SortKey = "name" | "category" | "location" | "status" | "dateApplied";

type Props = {
  companies: Company[];
  sort: SortKey;
  order: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => Promise<void> | void;
  bulkDeleting?: boolean;
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
  onBulkDelete,
  bulkDeleting = false,
}: Props) {
  const confirm = useConfirm();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const visibleIds = useMemo(
    () => companies.map((c) => c.id),
    [companies]
  );

  useEffect(() => {
    const visible = new Set(visibleIds);
    setSelectedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleIds]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    companies.length > 0 && selectedCount === companies.length;
  const someSelected = selectedCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(visibleIds));
  }

  async function handleBulkDelete() {
    if (selectedCount === 0 || bulkDeleting) return;
    const ok = await confirm({
      title: selectedCount === 1 ? "Delete company" : "Delete companies",
      description:
        selectedCount === 1
          ? "Delete 1 selected company? This cannot be undone."
          : `Delete ${selectedCount} selected companies? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    const ids = Array.from(selectedIds);
    await onBulkDelete(ids);
    setSelectedIds(new Set());
  }

  const headers: { key: SortKey; label: string; className?: string }[] = [
    { key: "name", label: "Company" },
    { key: "category", label: "Category", className: "hidden lg:table-cell" },
    { key: "location", label: "Location", className: "hidden md:table-cell" },
    { key: "status", label: "Status" },
    { key: "dateApplied", label: "Applied", className: "hidden sm:table-cell" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5">
          <p className="text-sm font-medium text-slate-800">
            {selectedCount} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {bulkDeleting ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {bulkDeleting ? "Deleting…" : "Delete selected"}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  disabled={companies.length === 0}
                  aria-label="Select all companies"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
              </th>
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
                  colSpan={7}
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
                  selected={selectedIds.has(c.id)}
                  onToggleSelect={toggleOne}
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
        {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
      </div>
    </div>
  );
}
