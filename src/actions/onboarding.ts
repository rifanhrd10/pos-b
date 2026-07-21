"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  businessSetupSchemaV2,
  planSelectionSchema,
  multiOutletSchema,
  operationsSchema,
} from "@/lib/validations";
import { DEFAULT_ROLES } from "@/lib/permissions";
import type { BusinessType } from "@prisma/client";
import { generateUniqueStoreCode } from "@/lib/store-code";

// Helper: get current user's business
async function getUserBusiness(userId: string) {
  return prisma.business.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });
}

// Helper: advance onboarding step in DB
async function advanceStep(businessId: string, nextStep: number) {
  await prisma.business.update({
    where: { id: businessId },
    data: { onboardingStep: nextStep },
  });
}

export async function setupBusiness(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    phone: (formData.get("phone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    province: (formData.get("province") as string) || undefined,
    npwp: (formData.get("npwp") as string) || undefined,
  };

  const result = businessSetupSchemaV2.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const logo = (formData.get("logo") as string) || undefined;

  // Check if business already exists (edit mode during onboarding)
  const existing = await getUserBusiness(session.user.id);
  if (existing) {
    const storeCode = await generateUniqueStoreCode(result.data.name, existing.id);
    await prisma.business.update({
      where: { id: existing.id },
      data: { ...result.data, logo, storeCode, onboardingStep: 2 },
    });
    return { success: true };
  }

  // Create business
  const storeCode = await generateUniqueStoreCode(result.data.name);
  const business = await prisma.business.create({
    data: {
      ownerId: session.user.id,
      name: result.data.name,
      type: result.data.type as BusinessType,
      phone: result.data.phone,
      address: result.data.address,
      city: result.data.city,
      province: result.data.province,
      npwp: result.data.npwp,
      logo,
      storeCode,
      onboardingStep: 2,
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

  return { success: true };
}

export async function selectPlan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = { planId: formData.get("planId") as string };
  const result = planSelectionSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  const plan = await prisma.plan.findUnique({ where: { id: result.data.planId } });
  if (!plan) return { error: "Plan tidak ditemukan" };

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { businessId: business.id },
    update: {
      planId: result.data.planId,
      status: "trial",
      trialEndsAt,
    },
    create: {
      businessId: business.id,
      planId: result.data.planId,
      status: "trial",
      trialEndsAt,
    },
  });

  await advanceStep(business.id, 3);
  return { success: true };
}

export async function createOutlets(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const hasMultiOutlet = formData.get("hasMultiOutlet") === "true";

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  const ownerEmployee = await prisma.employee.findFirst({
    where: { businessId: business.id, userId: session.user.id },
  });

  // Delete existing outlets if any (re-submission during onboarding edit)
  const existingOutlets = await prisma.outlet.findMany({ where: { businessId: business.id } });
  if (existingOutlets.length > 0) {
    await prisma.outlet.deleteMany({ where: { businessId: business.id } });
  }

  if (!hasMultiOutlet) {
    // Auto-create from business data
    const outlet = await prisma.outlet.create({
      data: {
        businessId: business.id,
        name: business.name,
        address: business.address || undefined,
        city: business.city || undefined,
        phone: business.phone || undefined,
        openTime: business.openTime || "08:00",
        closeTime: business.closeTime || "22:00",
      },
    });

    if (ownerEmployee) {
      await prisma.employeeOutlet.create({
        data: { employeeId: ownerEmployee.id, outletId: outlet.id },
      });
    }

    await prisma.business.update({
      where: { id: business.id },
      data: { hasMultiOutlet: false, onboardingStep: 4 },
    });

    return { success: true };
  }

  // Multi-outlet: parse from FormData (format: outlets[0][name], outlets[0][city], etc.)
  const outletNames: string[] = [];
  let i = 0;
  while (formData.get(`outlets[${i}][name]`)) {
    outletNames.push(formData.get(`outlets[${i}][name]`) as string);
    i++;
  }

  if (outletNames.length === 0) return { error: "Minimal 1 outlet harus diisi" };

  const outletsToCreate = outletNames.map((_, idx) => ({
    businessId: business.id,
    name: formData.get(`outlets[${idx}][name]`) as string,
    address: (formData.get(`outlets[${idx}][address]`) as string) || undefined,
    city: (formData.get(`outlets[${idx}][city]`) as string) || undefined,
    phone: (formData.get(`outlets[${idx}][phone]`) as string) || undefined,
  }));

  const multiResult = multiOutletSchema.safeParse({ hasMultiOutlet: true, outlets: outletsToCreate });
  if (!multiResult.success) return { error: multiResult.error.issues[0].message };

  for (const outletData of outletsToCreate) {
    const outlet = await prisma.outlet.create({ data: outletData });
    if (ownerEmployee) {
      await prisma.employeeOutlet.create({
        data: { employeeId: ownerEmployee.id, outletId: outlet.id },
      });
    }
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { hasMultiOutlet: true, onboardingStep: 4 },
  });

  return { success: true };
}

export async function setupOperations(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const hasShift = formData.get("hasShift") === "true";
  const shifts: Array<{ name: string; startTime: string; endTime: string }> = [];

  if (hasShift) {
    let i = 0;
    while (formData.get(`shifts[${i}][name]`)) {
      shifts.push({
        name: formData.get(`shifts[${i}][name]`) as string,
        startTime: formData.get(`shifts[${i}][startTime]`) as string,
        endTime: formData.get(`shifts[${i}][endTime]`) as string,
      });
      i++;
    }
  }

  const raw = {
    openTime: formData.get("openTime") as string,
    closeTime: formData.get("closeTime") as string,
    hasShift,
    shifts: hasShift ? shifts : undefined,
  };

  const result = operationsSchema.safeParse(raw);
  if (!result.success) return { error: result.error.issues[0].message };

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  await prisma.business.update({
    where: { id: business.id },
    data: {
      openTime: result.data.openTime,
      closeTime: result.data.closeTime,
      hasShift,
      onboardingStep: 5,
    },
  });

  // Update outlet operating hours (all outlets inherit from business)
  await prisma.outlet.updateMany({
    where: { businessId: business.id },
    data: { openTime: result.data.openTime, closeTime: result.data.closeTime },
  });

  if (hasShift && result.data.shifts && result.data.shifts.length > 0) {
    // Delete old shifts
    await prisma.shift.deleteMany({ where: { businessId: business.id } });
    // Create new shifts
    await prisma.shift.createMany({
      data: result.data.shifts.map((s) => ({
        businessId: business.id,
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    });
  }

  return { success: true };
}

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await getUserBusiness(session.user.id);
  if (!business) return { error: "Bisnis tidak ditemukan" };

  await prisma.business.update({
    where: { id: business.id },
    data: { onboardingDone: true, onboardingStep: 5 },
  });

  return { success: true };
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

  if (!business.hasMultiOutlet) {
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

    const managerEmp = await prisma.employee.findFirst({
      where: { businessId: business.id, roleId: managerRole.id },
    });

    if (managerEmp) {
      await prisma.employeeOutlet.create({
        data: { employeeId: managerEmp.id, outletId: outlet2.id },
      });
    }
  }

  return { success: true };
}
