"use server";

import { prisma } from "@/lib/prisma";

export async function getITAdminLogs(businessIdFilter?: string | null) {
  let whereClause = undefined;
  if (businessIdFilter === "SYSTEM") {
    whereClause = { businessId: null };
  } else if (businessIdFilter && businessIdFilter !== "ALL") {
    whereClause = { businessId: businessIdFilter };
  }

  const logs = await prisma.activityLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: { business: true },
    take: 100 // Limit to last 100 for performance
  });

  return logs;
}

export async function getAllBusinessesForFilter() {
  return await prisma.business.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });
}

export async function getTenantLogs(businessId: string) {
  const logs = await prisma.activityLog.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return logs;
}
