import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/DashboardClient";
import type { DashboardStats } from "@/types";

function computeStats(companies: { status: string }[]): DashboardStats {
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

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const companies = await prisma.company.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const stats = computeStats(companies);

  const serialized = companies.map((c) => ({
    ...c,
    dateApplied: c.dateApplied?.toISOString() ?? null,
    followUpDate: c.followUpDate?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient
      initialCompanies={serialized}
      initialStats={stats}
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
