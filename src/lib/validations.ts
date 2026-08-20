import { z } from "zod";
import { STATUSES } from "@/types";

export const signupSchema = z.object({
  email: z.string().email("Valid email is required").max(200),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  name: z.string().max(100).optional().nullable().or(z.literal("")),
});

export const companyCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.string().min(1, "Category is required").max(200),
  location: z.string().min(1, "Location is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  careersUrl: z.string().url().optional().nullable().or(z.literal("")),
  position: z.string().max(200).optional().nullable(),
  status: z.enum(STATUSES).optional().default("not_applied"),
  dateApplied: z.string().datetime().optional().nullable().or(z.literal("")),
  followUpDate: z.string().datetime().optional().nullable().or(z.literal("")),
  notes: z.string().max(5000).optional().nullable(),
});

export const companyUpdateSchema = companyCreateSchema.partial().extend({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(200).optional(),
  location: z.string().min(1).max(200).optional(),
});

export const companyBulkDeleteSchema = z.object({
  ids: z
    .array(z.string().min(1).max(40))
    .min(1, "Select at least one company")
    .max(200, "Too many companies in one request"),
});

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

/** Normalize empty strings / date-only inputs for Prisma */
export function normalizeCompanyPayload(data: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...data };

  for (const key of ["websiteUrl", "careersUrl", "description", "position", "notes"] as const) {
    if (out[key] === "") out[key] = null;
  }

  for (const key of ["dateApplied", "followUpDate"] as const) {
    const val = out[key];
    if (val === "" || val === null || val === undefined) {
      out[key] = null;
    } else if (typeof val === "string") {
      // Accept YYYY-MM-DD from date inputs
      out[key] = new Date(val.includes("T") ? val : `${val}T00:00:00.000Z`);
    }
  }

  return out;
}
