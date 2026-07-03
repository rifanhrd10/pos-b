"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { outletSchema, roleSchema } from "@/lib/validations";

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

  return { success: true, outletId: outlet.id };
}

export async function updateOutlet(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
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

// ============================================================
// ROLES
// ============================================================

export async function getRoles(businessId: string) {
  return prisma.role.findMany({
    where: { businessId },
    include: { _count: { select: { employees: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function createRole(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    permissions: JSON.parse(formData.get("permissions") as string || "[]"),
  };

  const result = roleSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await prisma.role.create({
    data: {
      businessId: business.id,
      name: result.data.name,
      description: result.data.description,
      permissions: result.data.permissions,
    },
  });

  return { success: true };
}

export async function updateRole(id: string, formData: FormData) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return { error: "Role not found" };
  if (role.isSystem) return { error: "System role tidak bisa diubah namanya" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    permissions: JSON.parse(formData.get("permissions") as string || "[]"),
  };

  const result = roleSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await prisma.role.update({
    where: { id },
    data: {
      name: result.data.name,
      description: result.data.description,
      permissions: result.data.permissions,
    },
  });

  return { success: true };
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return { error: "Role not found" };
  if (role.isSystem) return { error: "System role tidak bisa dihapus" };

  const employeeCount = await prisma.employee.count({ where: { roleId: id } });
  if (employeeCount > 0) {
    return { error: "Role masih digunakan oleh karyawan" };
  }

  await prisma.role.delete({ where: { id } });
  return { success: true };
}
