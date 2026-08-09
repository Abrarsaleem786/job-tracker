import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  companyUpdateSchema,
  normalizeCompanyPayload,
} from "@/lib/validations";

type RouteContext = { params: { id: string } };

async function findOwnedCompany(id: string, userId: string) {
  return prisma.company.findFirst({
    where: { id, userId },
  });
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await findOwnedCompany(params.id, userId);
  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await findOwnedCompany(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const parsed = companyUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = normalizeCompanyPayload(parsed.data);

  const company = await prisma.company.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(company);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await findOwnedCompany(params.id, userId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.company.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
