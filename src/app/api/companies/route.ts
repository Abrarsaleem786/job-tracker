import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  companyCreateSchema,
  normalizeCompanyPayload,
} from "@/lib/validations";

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const where: Record<string, unknown> = { userId };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { position: { contains: q } },
      { location: { contains: q } },
      { category: { contains: q } },
    ];
  }
  if (status) where.status = status;
  if (category) where.category = category;
  if (location) where.location = { contains: location };

  const allowedSort = [
    "name",
    "category",
    "location",
    "status",
    "dateApplied",
    "createdAt",
    "updatedAt",
  ];
  const sortField = allowedSort.includes(sort) ? sort : "name";

  const companies = await prisma.company.findMany({
    where,
    orderBy: { [sortField]: order },
  });

  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  if (
    typeof raw.dateApplied === "string" &&
    raw.dateApplied &&
    !raw.dateApplied.includes("T")
  ) {
    raw.dateApplied = `${raw.dateApplied}T00:00:00.000Z`;
  }
  if (
    typeof raw.followUpDate === "string" &&
    raw.followUpDate &&
    !raw.followUpDate.includes("T")
  ) {
    raw.followUpDate = `${raw.followUpDate}T00:00:00.000Z`;
  }
  if (raw.websiteUrl === "") raw.websiteUrl = null;
  if (raw.careersUrl === "") raw.careersUrl = null;

  const parsed = companyCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = normalizeCompanyPayload(parsed.data) as {
    name: string;
    category: string;
    location: string;
    description?: string | null;
    websiteUrl?: string | null;
    careersUrl?: string | null;
    position?: string | null;
    status?: string;
    dateApplied?: Date | null;
    followUpDate?: Date | null;
    notes?: string | null;
  };

  const company = await prisma.company.create({
    data: { ...data, userId },
  });
  return NextResponse.json(company, { status: 201 });
}
