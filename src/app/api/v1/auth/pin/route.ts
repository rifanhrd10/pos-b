import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import {
  authenticateMobile,
  hashRefreshToken,
  issueAccessToken,
  newRefreshToken,
  refreshExpiry,
  requireDeviceAdministrator,
} from "@/lib/mobile-auth";
import { createOfflinePinCredential, verifyEmployeePin } from "@/lib/mobile-pin";
import { getEntitlement } from "@/lib/mobile-subscription";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  outletId: z.string().min(1).max(200),
  employeeId: z.string().min(1).max(200),
  pin: z.string().regex(/^\d{4,6}$/),
  deviceId: z.string().min(8).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const context = await authenticateMobile(request);
    await requireDeviceAdministrator(context);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Outlet, kasir, atau PIN tidak valid");
    }
    const input = parsed.data;
    if (input.deviceId !== context.deviceId) {
      throw new MobileApiError(403, "DEVICE_MISMATCH", "Identitas perangkat tidak cocok");
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: input.employeeId,
        businessId: context.businessId,
        isActive: true,
        outlets: { some: { outletId: input.outletId, outlet: { isActive: true } } },
      },
      include: { role: true },
    });
    if (!employee || !employee.pin || !employee.role.permissions.includes("pos.access")) {
      throw new MobileApiError(403, "CASHIER_ACCESS_DENIED", "Kasir tidak aktif pada outlet ini");
    }
    if (!(await verifyEmployeePin(employee.id, employee.pin, input.pin))) {
      throw new MobileApiError(401, "INVALID_PIN", "PIN kasir salah");
    }

    const refreshToken = newRefreshToken();
    await prisma.mobileSession.update({
      where: { id: context.sessionId },
      data: {
        employeeId: employee.id,
        selectedOutletId: input.outletId,
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshExpiry(),
        lastSeenAt: new Date(),
      },
    });
    const [accessToken, entitlement] = await Promise.all([
      issueAccessToken({
        sessionId: context.sessionId,
        userId: context.userId,
        businessId: context.businessId,
        employeeId: employee.id,
        deviceId: context.deviceId,
        outletId: input.outletId,
      }),
      getEntitlement({
        businessId: context.businessId,
        sessionId: context.sessionId,
        deviceId: context.deviceId,
      }),
    ]);

    return noStoreJson({
      accessToken,
      refreshToken,
      user: {
        id: employee.id,
        businessId: context.businessId,
        name: employee.name,
        email: employee.email ?? context.user.email,
        role: employee.role.name,
        permissions: employee.role.permissions,
      },
      entitlement,
      offlineCredential: createOfflinePinCredential(employee.id, input.pin),
    });
  } catch (error) {
    return apiError(error);
  }
}
