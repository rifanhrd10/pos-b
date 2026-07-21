import type { NextRequest } from "next/server";
import { apiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { dailyCashierReport, jakartaDateKey } from "@/lib/mobile-shift";

export async function GET(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    const date = request.nextUrl.searchParams.get("date") ?? jakartaDateKey(new Date());
    return noStoreJson(await dailyCashierReport(context, date));
  } catch (error) {
    return apiError(error);
  }
}
