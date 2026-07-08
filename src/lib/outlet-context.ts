import { cookies } from "next/headers";

const ACTIVE_OUTLET_COOKIE = "bayaro_active_outlet_id";

export async function getActiveOutletId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_OUTLET_COOKIE)?.value ?? null;
}

export async function setActiveOutletCookie(outletId: string | null) {
  const store = await cookies();
  if (!outletId) {
    store.delete(ACTIVE_OUTLET_COOKIE);
    return;
  }
  store.set(ACTIVE_OUTLET_COOKIE, outletId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

const KASIR_OUTLET_COOKIE = "bayaro_kasir_outlet_id";
const KASIR_EMPLOYEE_COOKIE = "bayaro_kasir_employee_id";

export async function getKasirOutletId(): Promise<string | null> {
  const store = await cookies();
  return store.get(KASIR_OUTLET_COOKIE)?.value ?? null;
}

export async function setKasirOutletCookie(outletId: string | null): Promise<void> {
  const store = await cookies();
  if (!outletId) { store.delete(KASIR_OUTLET_COOKIE); return; }
  store.set(KASIR_OUTLET_COOKIE, outletId, { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
}

export async function getKasirEmployeeId(): Promise<string | null> {
  const store = await cookies();
  return store.get(KASIR_EMPLOYEE_COOKIE)?.value ?? null;
}

export async function setKasirEmployeeCookie(employeeId: string | null): Promise<void> {
  const store = await cookies();
  if (!employeeId) { store.delete(KASIR_EMPLOYEE_COOKIE); return; }
  store.set(KASIR_EMPLOYEE_COOKIE, employeeId, { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
}
