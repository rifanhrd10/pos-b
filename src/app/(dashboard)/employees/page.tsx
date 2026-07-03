import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmployeesClient } from "./employees-client";

export default async function EmployeesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) redirect("/dashboard");

  const [employees, roles, outlets] = await Promise.all([
    prisma.employee.findMany({
      where: { businessId: business.id },
      include: {
        role: true,
        outlets: { include: { outlet: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.findMany({ where: { businessId: business.id } }),
    prisma.outlet.findMany({ where: { businessId: business.id } }),
  ]);

  return <EmployeesClient employees={employees} roles={roles} outlets={outlets} />;
}
