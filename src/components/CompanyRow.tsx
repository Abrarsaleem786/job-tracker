"use client";

import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import type { Company } from "@/types";
import { STATUSES, STATUS_LABELS, type Status } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { useConfirm } from "./ConfirmDialog";

type Props = {
  company: Company;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function CompanyRow({
  company,
  selected,
  onToggleSelect,
  onStatusChange,
  onDelete,
}: Props) {
  const confirm = useConfirm();

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
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50/80 ${
        selected ? "bg-blue-50/70 hover:bg-blue-50" : ""
      }`}
    >
      <td className="w-10 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(company.id)}
          aria-label={`Select ${company.name}`}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
        />
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/companies/${company.id}`}
          className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
        >
          {company.name}
        </Link>
        {company.position && (
          <p className="mt-0.5 text-xs text-slate-500">{company.position}</p>
        )}
      </td>
      <td className="hidden px-4 py-3 text-sm text-slate-600 lg:table-cell">
        <span className="line-clamp-2 max-w-[220px]">{company.category}</span>
      </td>
      <td className="hidden px-4 py-3 text-sm text-slate-600 md:table-cell">
        {company.location}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <StatusBadge status={company.status} />
          <select
            value={company.status}
            onChange={(e) => onStatusChange(company.id, e.target.value)}
            className="max-w-[160px] rounded border border-slate-200 bg-white px-1.5 py-1 text-xs outline-none ring-blue-500 focus:ring-1"
            aria-label={`Status for ${company.name}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s as Status]}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
        {formatDate(company.dateApplied)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
              title="Website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
