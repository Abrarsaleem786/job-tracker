"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import type { Company } from "@/types";
import { STATUSES, STATUS_LABELS, type Status } from "@/types";
import { StatusBadge } from "./StatusBadge";

type Props = { company: Company };

function toDateInput(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function CompanyDetailForm({ company }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: company.name,
    category: company.category,
    location: company.location,
    description: company.description || "",
    websiteUrl: company.websiteUrl || "",
    careersUrl: company.careersUrl || "",
    position: company.position || "",
    status: company.status,
    dateApplied: toDateInput(company.dateApplied),
    followUpDate: toDateInput(company.followUpDate),
    notes: company.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          websiteUrl: form.websiteUrl || null,
          careersUrl: form.careersUrl || null,
          description: form.description || null,
          position: form.position || null,
          notes: form.notes || null,
          dateApplied: form.dateApplied || null,
          followUpDate: form.followUpDate || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setMessage("Saved successfully");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${company.name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/companies/${company.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Failed to delete company");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <StatusBadge status={form.status} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{company.category}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {form.websiteUrl && (
              <a
                href={form.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {form.careersUrl && (
              <a
                href={form.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Careers <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Position">
              <input
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Category *">
              <input
                required
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Location *">
              <input
                required
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s as Status]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date applied">
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => set("dateApplied", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Follow-up date">
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Website URL">
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => set("websiteUrl", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </Field>
            <Field label="Careers URL">
              <input
                type="url"
                value={form.careersUrl}
                onChange={(e) => set("careersUrl", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className={inputClass}
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}
