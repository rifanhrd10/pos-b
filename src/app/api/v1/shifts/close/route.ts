import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import { authenticateMobile } from "@/lib/mobile-auth";
import { selectedOutletId, shiftSnapshot } from "@/lib/mobile-shift";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sessionId: z.string().min(1),
  closingCash: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Kas akhir shift tidak valid");
    }
    const session = await prisma.cashierSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        businessId: context.businessId,
        outletId: selectedOutletId(context),
        employeeId: context.employeeId,
      },
    });
    if (!session) throw new MobileApiError(404, "SHIFT_NOT_FOUND", "Shift kasir tidak ditemukan");
    if (!session.isOpen) throw new MobileApiError(409, "SHIFT_ALREADY_CLOSED", "Shift kasir sudah ditutup");
    const beforeClose = await shiftSnapshot(session.id);
    const expectedCash = beforeClose?.expectedCash ?? Math.round(session.initialCash);
    await prisma.cashierSession.update({
      where: { id: session.id },
      data: {
        isOpen: false,
        closedAt: new Date(),
        closingCash: parsed.data.closingCash,
        expectedCash,
        difference: parsed.data.closingCash - expectedCash,
        note: parsed.data.note,
      },
    });
    return noStoreJson({ closedSession: await shiftSnapshot(session.id), serverTime: Date.now() });
  } catch (error) {
    return apiError(error);
  }
}
