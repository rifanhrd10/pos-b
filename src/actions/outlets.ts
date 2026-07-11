"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { outletSchema } from "@/lib/validations";
import { setActiveOutletCookie } from "@/lib/outlet-context";

// ============================================================
// OUTLETS
// ============================================================

export async function getOutlets(businessId: string) {
  return prisma.outlet.findMany({
    where: { businessId },
    include: {
      _count: { select: { employees: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOutlet(id: string) {
  return prisma.outlet.findUnique({
    where: { id },
    include: {
      employees: {
        include: { employee: { include: { role: true } } },
      },
    },
  });
}

export async function createOutlet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const raw = {
    name: formData.get("name") as string,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    province: formData.get("province") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    openTime: formData.get("openTime") as string || undefined,
    closeTime: formData.get("closeTime") as string || undefined,
  };

  const result = outletSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const logo = formData.get("logo") as string || undefined;

  const outlet = await prisma.outlet.create({
    data: {
      businessId: business.id,
      ...result.data,
      logo,
    },
  });

  // Auto-assign owner to new outlet
  const ownerEmployee = await prisma.employee.findFirst({
    where: { businessId: business.id, userId: session.user.id },
  });
  if (ownerEmployee) {
    await prisma.employeeOutlet.create({
      data: { employeeId: ownerEmployee.id, outletId: outlet.id },
    });
  }

  return { success: true };
}

export async function updateOutlet(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    province: formData.get("province") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    openTime: formData.get("openTime") as string || undefined,
    closeTime: formData.get("closeTime") as string || undefined,
  };

  const result = outletSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const logo = formData.get("logo") as string || undefined;

  await prisma.outlet.update({
    where: { id },
    data: { ...result.data, ...(logo ? { logo } : {}) },
  });

  return { success: true };
}

export async function toggleOutletStatus(id: string) {
  const outlet = await prisma.outlet.findUnique({ where: { id } });
  if (!outlet) return { error: "Outlet not found" };

  await prisma.outlet.update({
    where: { id },
    data: { isActive: !outlet.isActive },
  });

  return { success: true };
}

export async function deleteOutlet(id: string) {
  await prisma.outlet.delete({ where: { id } });
  return { success: true };
}

export async function switchActiveOutlet(outletId: string | null) {
  await setActiveOutletCookie(outletId);
  return { success: true };
}

