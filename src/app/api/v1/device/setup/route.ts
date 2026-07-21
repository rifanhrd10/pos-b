import type { NextRequest } from "next/server";
import { apiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile, requireDeviceAdministrator } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    await requireDeviceAdministrator(context);

    const [business, outlets, employees] = await Promise.all([
      prisma.business.findUniqueOrThrow({
        where: { id: context.businessId },
        select: { id: true, name: true },
      }),
      prisma.outlet.findMany({
        where: { businessId: context.businessId, isActive: true },
        select: { id: true, name: true, address: true, isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: {
          businessId: context.businessId,
          isActive: true,
          pin: { not: null },
          role: { permissions: { has: "pos.access" } },
          outlets: { some: { outlet: { isActive: true } } },
        },
        include: {
          role: { select: { name: true, permissions: true } },
          outlets: { select: { outletId: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return noStoreJson({
      business,
      outlets,
      cashiers: employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role.name,
        permissions: employee.role.permissions,
        outletIds: employee.outlets.map((row) => row.outletId),
        hasPin: Boolean(employee.pin),
      })),
    });
  } catch (error) {
    return apiError(error);
  }
}
