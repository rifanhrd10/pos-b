import type { NextRequest } from "next/server";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { getEntitlement } from "@/lib/mobile-subscription";
import { catalogSnapshot, currentSyncCursor } from "@/lib/mobile-sync";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    if (context.outletIds.length === 0) {
      throw new MobileApiError(403, "OUTLET_ACCESS_DENIED", "Kasir belum ditugaskan ke outlet aktif");
    }
    const cursor = await currentSyncCursor(context.businessId);
    const [catalog, entitlement] = await Promise.all([
      catalogSnapshot(context),
      getEntitlement({
        businessId: context.businessId,
        sessionId: context.sessionId,
        deviceId: context.deviceId,
      }),
    ]);
    return noStoreJson({ cursor, ...catalog, entitlement, serverTime: Date.now() });
  } catch (error) {
    return apiError(error);
  }
}
