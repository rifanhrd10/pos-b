import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { activeShift, selectedOutletId, shiftSnapshot } from "@/lib/mobile-shift";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  initialCash: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  openedAt: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Modal awal shift tidak valid");
    }
    const existing = await activeShift(context);
    if (existing) {
      return noStoreJson({ activeSession: await shiftSnapshot(existing.id), serverTime: Date.now() });
    }
    const clientOpenedAt = parsed.data.openedAt ? new Date(parsed.data.openedAt) : new Date();
    const oldestAllowed = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const openedAt = Number.isNaN(clientOpenedAt.getTime()) || clientOpenedAt.getTime() < oldestAllowed || clientOpenedAt.getTime() > Date.now() + 5 * 60 * 1000
      ? new Date()
      : clientOpenedAt;
    const session = await prisma.cashierSession.create({
      data: {
        businessId: context.businessId,
        outletId: selectedOutletId(context),
        employeeId: context.employeeId,
        initialCash: parsed.data.initialCash,
        openedAt,
        isOpen: true,
      },
    });
    return noStoreJson({ activeSession: await shiftSnapshot(session.id), serverTime: Date.now() }, 201);
  } catch (error) {
    return apiError(error);
  }
}
