"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, LogOut, Download } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Company, DashboardStats as Stats } from "@/types";
import { DashboardStats } from "./DashboardStats";
import { CompanyTable } from "./CompanyTable";
import { FilterBar, type Filters } from "./FilterBar";
import { AddCompanyModal } from "./AddCompanyModal";

type SortKey = "name" | "category" | "location" | "status" | "dateApplied";

type Props = {
  initialCompanies: Company[];
  initialStats: Stats;
  userEmail?: string | null;
  userName?: string | null;
};

function computeStats(companies: Company[]): Stats {
  const total = companies.length;
  const applied = companies.filter((c) =>
    [
      "applied",
      "interview_scheduled",
      "interviewed",
      "offer",
      "rejected",
    ].includes(c.status)
  ).length;
  const interviewing = companies.filter((c) =>
    ["interview_scheduled", "interviewed"].includes(c.status)
  ).length;
  const offers = companies.filter((c) => c.status === "offer").length;
  const rejected = companies.filter((c) => c.status === "rejected").length;
  const responded = companies.filter((c) =>
    ["interview_scheduled", "interviewed", "offer", "rejected"].includes(
      c.status
    )
  ).length;
  const responseRate =
    applied > 0 ? Math.round((responded / applied) * 100) : 0;

  const statusMap = new Map<string, number>();
  for (const c of companies) {
    statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
  }
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    total,
    applied,
    interviewing,
    offers,
    rejected,
    responseRate,
    byStatus,
  };
}

export function DashboardClient({
  initialCompanies,
  initialStats,
  userEmail,
  userName,
}: Props) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [stats, setStats] = useState(initialStats);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    status: "",
    category: "",
    location: "",
  });
  const [sort, setSort] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(companies.map((c) => c.category))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [companies]
  );

  const locations = useMemo(
    () =>
      Array.from(new Set(companies.map((c) => c.location))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [companies]
  );

  const refresh = useCallback(async () => {
    const res = await fetch("/api/companies");
    if (!res.ok) return;
    const data: Company[] = await res.json();
    setCompanies(data);
    setStats(computeStats(data));
  }, []);

  const filtered = useMemo(() => {
    let list = [...companies];
    const q = filters.q.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.position || "").toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    if (filters.status) list = list.filter((c) => c.status === filters.status);
    if (filters.category)
      list = list.filter((c) => c.category === filters.category);
    if (filters.location)
      list = list.filter((c) => c.location === filters.location);

    list.sort((a, b) => {
      const av = a[sort] ?? "";
      const bv = b[sort] ?? "";
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return order === "asc" ? cmp : -cmp;
    });

    return list;
  }, [companies, filters, sort, order]);

  function handleSort(key: SortKey) {
    if (sort === key) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setOrder("asc");
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setCompanies((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, status } : c));
      setStats(computeStats(next));
      return next;
    });

    const res = await fetch(`/api/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      await refresh();
    }
  }

  async function handleDelete(id: string) {
    setCompanies((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setStats(computeStats(next));
      return next;
    });
    const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
    if (!res.ok) await refresh();
  }

  async function handleImportStarter() {
    setImporting(true);
    setImportMessage(null);
    try {
      const res = await fetch("/api/companies/import-starter", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setImportMessage(data.error || "Import failed");
        return;
      }
      setImportMessage(data.message || `Imported ${data.imported} companies`);
      await refresh();
    } catch {
      setImportMessage("Import failed");
    } finally {
      setImporting(false);
    }
  }

  const displayName = userName || userEmail;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Job Application Tracker
            </h1>
            <p className="text-sm text-slate-500">
              Your private application pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            {displayName && (
              <span className="hidden max-w-[180px] truncate text-sm text-slate-500 sm:inline">
                {displayName}
              </span>
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add company
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <DashboardStats stats={stats} />

        {companies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Your tracker is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Add companies one by one, or import a starter list of 50 IT
              companies in Islamabad &amp; Rawalpindi. Only you can see your
              data.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add company
              </button>
              <button
                type="button"
                onClick={handleImportStarter}
                disabled={importing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {importing ? "Importing…" : "Import starter list (50)"}
              </button>
            </div>
            {importMessage && (
              <p className="mt-4 text-sm text-slate-600">{importMessage}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FilterBar
                filters={filters}
                categories={categories}
                locations={locations}
                onChange={setFilters}
              />
              <button
                type="button"
                onClick={handleImportStarter}
                disabled={importing}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                title="Add any missing companies from the starter catalog"
              >
                <Download className="h-3.5 w-3.5" />
                {importing ? "Importing…" : "Import missing starters"}
              </button>
            </div>
            {importMessage && (
              <p className="text-sm text-slate-600">{importMessage}</p>
            )}
            <CompanyTable
              companies={filtered}
              sort={sort}
              order={order}
              onSort={handleSort}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>

      <AddCompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
        defaultCategories={categories}
      />
    </div>
  );
}
