import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OutletsClient } from "./outlets-client";

export default async function OutletsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) redirect("/dashboard");

  const outlets = await prisma.outlet.findMany({
    where: { businessId: business.id },
    include: {
      _count: { select: { employees: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return <OutletsClient outlets={outlets} />;
}
