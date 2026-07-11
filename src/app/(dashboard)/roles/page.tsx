import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RolesClient } from "./roles-client";

export default async function RolesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) redirect("/dashboard");

  const roles = await prisma.role.findMany({
    where: { businessId: business.id },
    include: { _count: { select: { employees: true } } },
    orderBy: { createdAt: "asc" },
  });

  return <RolesClient roles={roles} />;
}
