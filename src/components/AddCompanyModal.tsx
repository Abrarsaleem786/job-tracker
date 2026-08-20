"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { STATUSES, STATUS_LABELS, type Status } from "@/types";
import { Spinner } from "./Spinner";
import { useToast } from "./ToastProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultCategories: string[];
};

const empty = {
  name: "",
  category: "",
  location: "",
  description: "",
  websiteUrl: "",
  careersUrl: "",
  position: "",
  status: "not_applied",
  notes: "",
};

export function AddCompanyModal({
  open,
  onClose,
  onCreated,
  defaultCategories,
}: Props) {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          websiteUrl: form.websiteUrl || null,
          careersUrl: form.careersUrl || null,
          description: form.description || null,
          position: form.position || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create company");
      }
      toast.success(`${form.name} added`);
      setForm(empty);
      onCreated();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add company</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Name *" required>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Category *">
            <input
              required
              list="category-options"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
            />
            <datalist id="category-options">
              {defaultCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Location *">
            <input
              required
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
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
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && <Spinner />}
              {loading ? "Saving…" : "Add company"}
            </button>
          </div>
        </form>
      </div>
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
  required?: boolean;
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
