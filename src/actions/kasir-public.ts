"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const KASIR_EMPLOYEE_COOKIE = "bayaro_kasir_employee_id";
const KASIR_OUTLET_COOKIE = "bayaro_kasir_outlet_id";
const KASIR_BUSINESS_COOKIE = "bayaro_kasir_business_id";

const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 8 * 60 * 60, // 8 hours
};

// ── Public outlet list (no auth needed) ──────────────────────────────────────

export type PublicOutlet = {
  id: string;
  name: string;
  businessName: string;
  address: string | null;
  city: string | null;
};

export async function getPublicOutlets(): Promise<PublicOutlet[]> {
  const outlets = await prisma.outlet.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      business: { select: { name: true } },
    },
    orderBy: [{ business: { name: "asc" } }, { name: "asc" }],
  });

  return outlets.map((o) => ({
    id: o.id,
    name: o.name,
    businessName: o.business.name,
    address: o.address,
    city: o.city,
  }));
}

// ── Verify PIN for kasir entry (no NextAuth) ─────────────────────────────────

export async function verifyKasirEntryPin(
  outletId: string,
  pin: string
): Promise<{ ok: true; employeeName: string } | { ok: false; error: string }> {
  if (!outletId || !pin) {
    return { ok: false, error: "Data tidak lengkap" };
  }

  // Find all active employees assigned to this outlet
  const employeeOutlets = await prisma.employeeOutlet.findMany({
    where: { outletId },
    select: {
      employee: {
        select: {
          id: true,
          name: true,
          pin: true,
          isActive: true,
          businessId: true,
          role: { select: { permissions: true } },
        },
      },
    },
  });

  for (const { employee } of employeeOutlets) {
    if (!employee.isActive) continue;
    if (!employee.pin) continue;

    const pinMatch = await bcrypt.compare(pin, employee.pin);
    if (!pinMatch) continue;

    // Check pos.access permission
    const hasAccess = employee.role.permissions.includes("pos.access");
    if (!hasAccess) {
      return { ok: false, error: "Akun ini tidak memiliki akses POS" };
    }

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set(KASIR_EMPLOYEE_COOKIE, employee.id, COOKIE_OPTIONS);
    cookieStore.set(KASIR_OUTLET_COOKIE, outletId, COOKIE_OPTIONS);
    cookieStore.set(KASIR_BUSINESS_COOKIE, employee.businessId, COOKIE_OPTIONS);

    return { ok: true, employeeName: employee.name };
  }

  return { ok: false, error: "PIN tidak valid" };
}

// ── Sign out kasir (clear cookies) ──────────────────────────────────────────

export async function signOutKasirPublic(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(KASIR_EMPLOYEE_COOKIE);
  cookieStore.delete(KASIR_OUTLET_COOKIE);
  cookieStore.delete(KASIR_BUSINESS_COOKIE);
  redirect("/kasir/enter");
}
