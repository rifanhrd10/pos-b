"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function getEmployees(businessId: string) {
  return prisma.employee.findMany({
    where: { businessId },
    omit: { pin: true },
    include: {
      role: true,
      outlets: { include: { outlet: true } },
      user: { select: { id: true, email: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEmployee(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    omit: { pin: true },
    include: {
      role: true,
      outlets: { include: { outlet: true } },
      user: { select: { id: true, email: true, avatar: true } },
    },
  });
}

export async function createEmployee(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return { error: "Business not found" };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string || "",
    phone: formData.get("phone") as string || "",
    roleId: formData.get("roleId") as string,
    outletIds: JSON.parse(formData.get("outletIds") as string || "[]"),
    pin: formData.get("pin") as string || "",
  };

  const result = employeeSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, phone, roleId, outletIds, pin } = result.data;

  // Create employee
  const employee = await prisma.employee.create({
    data: {
      businessId: business.id,
      name,
      email: email || undefined,
      phone: phone || undefined,
      roleId,
      pin: pin ? await bcrypt.hash(pin, 10) : undefined,
    },
  });

  // Assign outlets (multi-outlet support)
  for (const outletId of outletIds) {
    await prisma.employeeOutlet.create({
      data: { employeeId: employee.id, outletId },
    });
  }

  return { success: true };
}

export async function updateEmployee(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string || "",
    phone: formData.get("phone") as string || "",
    roleId: formData.get("roleId") as string,
    outletIds: JSON.parse(formData.get("outletIds") as string || "[]"),
    pin: formData.get("pin") as string || "",
  };

  const result = employeeSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, phone, roleId, outletIds, pin } = result.data;

  // Update employee
  await prisma.employee.update({
    where: { id },
    data: {
      name,
      email: email || undefined,
      phone: phone || undefined,
      roleId,
      pin: pin ? await bcrypt.hash(pin, 10) : undefined,
    },
  });

  // Reassign outlets
  await prisma.employeeOutlet.deleteMany({ where: { employeeId: id } });
  for (const outletId of outletIds) {
    await prisma.employeeOutlet.create({
      data: { employeeId: id, outletId },
    });
  }

  return { success: true };
}

export async function toggleEmployeeStatus(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return { error: "Employee not found" };

  await prisma.employee.update({
    where: { id },
    data: { isActive: !employee.isActive },
  });

  return { success: true };
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  return { success: true };
}
