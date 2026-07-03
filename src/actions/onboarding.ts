"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { businessSetupSchema, outletSetupSchema } from "@/lib/validations";
import { DEFAULT_ROLES } from "@/lib/permissions";
import type { BusinessType } from "@prisma/client";

export async function setupBusiness(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    phone: formData.get("phone") as string || undefined,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    province: formData.get("province") as string || undefined,
  };

  const result = businessSetupSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const logo = formData.get("logo") as string || undefined;

  // Create business
  const business = await prisma.business.create({
    data: {
      ownerId: session.user.id,
      name: result.data.name,
      type: result.data.type as BusinessType,
      phone: result.data.phone,
      address: result.data.address,
      city: result.data.city,
      province: result.data.province,
      logo,
    },
  });

  // Create default roles
  for (const [, roleData] of Object.entries(DEFAULT_ROLES)) {
    await prisma.role.create({
      data: {
        businessId: business.id,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        isSystem: true,
      },
    });
  }

  // Create owner employee record
  const ownerRole = await prisma.role.findFirst({
    where: { businessId: business.id, name: "Owner" },
  });

  if (ownerRole) {
    await prisma.employee.create({
      data: {
        businessId: business.id,
        userId: session.user.id,
        roleId: ownerRole.id,
        name: session.user.name || "Owner",
        email: session.user.email || undefined,
      },
    });
  }

  return { success: true, businessId: business.id };
}

export async function createFirstOutlet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    openTime: formData.get("openTime") as string || undefined,
    closeTime: formData.get("closeTime") as string || undefined,
  };

  const result = outletSetupSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const logo = formData.get("logo") as string || undefined;

  // Get user's business
  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!business) return { error: "Business not found" };

  // Create outlet
  const outlet = await prisma.outlet.create({
    data: {
      businessId: business.id,
      name: result.data.name,
      address: result.data.address,
      city: result.data.city,
      phone: result.data.phone,
      openTime: result.data.openTime,
      closeTime: result.data.closeTime,
      logo,
    },
  });

  // Assign owner to this outlet
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

export async function seedDemoData() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: { outlets: true, roles: true },
    orderBy: { createdAt: "desc" },
  });

  if (!business) return { error: "Business not found" };
  if (business.outlets.length === 0) return { error: "No outlet found" };

  const outlet = business.outlets[0];
  const cashierRole = business.roles.find((r) => r.name === "Kasir");
  const managerRole = business.roles.find((r) => r.name === "Manager");

  if (!cashierRole || !managerRole) return { error: "Roles not found" };

  // Create demo employees
  const demoEmployees = [
    { name: "Budi Santoso", email: "budi@demo.id", phone: "081234567890", roleId: managerRole.id },
    { name: "Siti Rahma", email: "siti@demo.id", phone: "081234567891", roleId: cashierRole.id },
    { name: "Andi Wijaya", email: "andi@demo.id", phone: "081234567892", roleId: cashierRole.id },
  ];

  for (const emp of demoEmployees) {
    const employee = await prisma.employee.create({
      data: {
        businessId: business.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        roleId: emp.roleId,
        pin: "1234",
      },
    });
    await prisma.employeeOutlet.create({
      data: { employeeId: employee.id, outletId: outlet.id },
    });
  }

  // Create a second demo outlet
  const outlet2 = await prisma.outlet.create({
    data: {
      businessId: business.id,
      name: "Cabang Kedua (Demo)",
      address: "Jl. Contoh No. 2",
      city: business.city || "Jakarta",
      openTime: "09:00",
      closeTime: "21:00",
    },
  });

  // Assign manager to both outlets (demo multi-outlet)
  const managerEmp = await prisma.employee.findFirst({
    where: { businessId: business.id, roleId: managerRole.id },
  });
  if (managerEmp) {
    await prisma.employeeOutlet.create({
      data: { employeeId: managerEmp.id, outletId: outlet2.id },
    });
  }

  return { success: true };
}
