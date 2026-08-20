"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, LayoutGrid, Trash2 } from "lucide-react";
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

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Company" },
  { key: "category", label: "Category" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "dateApplied", label: "Applied" },
];

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

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Companies
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {companies.length} shown
            {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAllVisible}
            disabled={companies.length === 0}
            aria-label="Select all companies"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
          />
          Select all
        </label>
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Sort
          </span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSort(opt.key)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                sort === opt.key
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
              <SortIcon active={sort === opt.key} order={order} />
            </button>
          ))}
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 px-4 py-2.5 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">
            {selectedCount} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
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

      {companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-16 text-center text-sm text-slate-500">
          No companies match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((c) => (
            <CompanyRow
              key={c.id}
              company={c}
              selected={selectedIds.has(c.id)}
              onToggleSelect={toggleOne}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
