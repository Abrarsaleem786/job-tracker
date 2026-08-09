import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyDetailForm } from "@/components/CompanyDetailForm";

type Props = { params: { id: string } };

export default async function CompanyDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const company = await prisma.company.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!company) notFound();

  const serialized = {
    ...company,
    dateApplied: company.dateApplied?.toISOString() ?? null,
    followUpDate: company.followUpDate?.toISOString() ?? null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };

  return <CompanyDetailForm company={serialized} />;
}
