import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";

export async function POST(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    await prisma.mobileSession.update({
      where: { id: context.sessionId },
      data: { revokedAt: new Date() },
    });
    return noStoreJson({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
