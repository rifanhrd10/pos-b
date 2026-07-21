import type { NextRequest } from "next/server";
import { apiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { getEntitlement } from "@/lib/mobile-subscription";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    return noStoreJson(
      await getEntitlement({
        businessId: context.businessId,
        sessionId: context.sessionId,
        deviceId: context.deviceId,
      })
    );
  } catch (error) {
    return apiError(error);
  }
}
