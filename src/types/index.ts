export const STATUSES = [
  "not_applied",
  "researching",
  "applied",
  "interview_scheduled",
  "interviewed",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  not_applied: "Not Applied",
  researching: "Researching",
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<Status, string> = {
  not_applied: "bg-slate-100 text-slate-700 border-slate-200",
  researching: "bg-violet-100 text-violet-700 border-violet-200",
  applied: "bg-blue-100 text-blue-700 border-blue-200",
  interview_scheduled: "bg-amber-100 text-amber-800 border-amber-200",
  interviewed: "bg-orange-100 text-orange-700 border-orange-200",
  offer: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  withdrawn: "bg-gray-100 text-gray-600 border-gray-200",
};

export type Company = {
  id: string;
  userId?: string;
  name: string;
  category: string;
  location: string;
  description: string | null;
  websiteUrl: string | null;
  careersUrl: string | null;
  position: string | null;
  status: string;
  dateApplied: string | Date | null;
  followUpDate: string | Date | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DashboardStats = {
  total: number;
  applied: number;
  interviewing: number;
  offers: number;
  rejected: number;
  responseRate: number;
  byStatus: { status: string; count: number }[];
};
