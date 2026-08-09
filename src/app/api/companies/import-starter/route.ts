import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STARTER_COMPANIES } from "@/data/starter-companies";

/**
 * Import the shared Islamabad/RWP starter company list into the current user's tracker.
 * Skips names the user already has.
 */
export async function POST() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.company.findMany({
    where: { userId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

  const toCreate = STARTER_COMPANIES.filter(
    (c) => !existingNames.has(c.name.toLowerCase())
  ).map((c) => ({
    userId,
    name: c.name,
    category: c.category,
    location: c.location,
    description: c.description,
    status: "not_applied",
  }));

  if (toCreate.length === 0) {
    return NextResponse.json({
      imported: 0,
      message: "All starter companies are already in your list.",
    });
  }

  const result = await prisma.company.createMany({ data: toCreate });

  return NextResponse.json({
    imported: result.count,
    message: `Imported ${result.count} companies.`,
  });
}
