import type { NextRequest } from "next/server";
import { apiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { activeShift, shiftSnapshot } from "@/lib/mobile-shift";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    const session = await activeShift(context);
    return noStoreJson({
      activeSession: session ? await shiftSnapshot(session.id) : null,
      serverTime: Date.now(),
    });
  } catch (error) {
    return apiError(error);
  }
}
