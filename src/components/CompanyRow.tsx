"use client";

import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin, Trash2 } from "lucide-react";
import type { Company } from "@/types";
import { STATUSES, STATUS_COLORS, STATUS_LABELS, type Status } from "@/types";
import { useConfirm } from "./ConfirmDialog";

type Props = {
  company: Company;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
};

const AVATAR_TONES = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-cyan-600",
  "from-fuchsia-500 to-violet-600",
];

const STATUS_ACCENT: Record<Status, string> = {
  not_applied: "border-l-slate-300",
  researching: "border-l-violet-400",
  applied: "border-l-blue-500",
  interview_scheduled: "border-l-amber-400",
  interviewed: "border-l-orange-400",
  offer: "border-l-emerald-500",
  rejected: "border-l-red-400",
  withdrawn: "border-l-gray-400",
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function avatarTone(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

export function CompanyRow({
  company,
  selected,
  onToggleSelect,
  onStatusChange,
  onDelete,
}: Props) {
  const confirm = useConfirm();
  const statusKey = (
    company.status in STATUS_LABELS ? company.status : "not_applied"
  ) as Status;
  const applied = formatDate(company.dateApplied);

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete company",
      description: `Delete ${company.name}? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (ok) onDelete(company.id);
  }

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-l-4 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(15,23,42,0.12)] ${
        STATUS_ACCENT[statusKey]
      } ${
        selected
          ? "border-blue-300 ring-2 ring-blue-100"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-50 to-transparent" />

      <div className="relative flex items-start gap-3 p-4 pb-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(company.id)}
          aria-label={`Select ${company.name}`}
          className="mt-2.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 accent-blue-600"
        />
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-md ${avatarTone(
            company.name
          )}`}
          aria-hidden
        >
          {initials(company.name)}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <Link
            href={`/companies/${company.id}`}
            className="block truncate text-[15px] font-semibold tracking-tight text-slate-900 hover:text-blue-600"
          >
            {company.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {company.position || "No position set"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl p-2 text-slate-400 opacity-70 transition hover:bg-blue-50 hover:text-blue-600 hover:opacity-100"
              title="Website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl p-2 text-slate-400 opacity-70 transition hover:bg-red-50 hover:text-red-600 hover:opacity-100"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-1.5 px-4">
        <span className="inline-flex max-w-[60%] truncate rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {company.category}
        </span>
        <span className="inline-flex max-w-[40%] items-center gap-1 truncate rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          {company.location}
        </span>
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
        <select
          value={company.status}
          onChange={(e) => onStatusChange(company.id, e.target.value)}
          className={`min-w-0 flex-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold outline-none ring-blue-500 focus:ring-2 ${STATUS_COLORS[statusKey]}`}
          aria-label={`Status for ${company.name}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s as Status]}
            </option>
          ))}
        </select>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium tabular-nums text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          {applied ?? "—"}
        </span>
      </div>
    </article>
  );
}
