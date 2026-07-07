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
