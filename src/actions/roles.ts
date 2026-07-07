"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleSchema } from "@/lib/validations";

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
