import { z } from "zod";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import {
  hashRefreshToken,
  issueAccessToken,
  newRefreshToken,
  refreshExpiry,
} from "@/lib/mobile-auth";
import { createOfflinePinCredential, verifyEmployeePin } from "@/lib/mobile-pin";
import { getEntitlement } from "@/lib/mobile-subscription";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  storeCode: z.string().trim().min(1).max(50),
  outletId: z.string().min(1).max(200),
  pin: z.string().regex(/^\d{4,6}$/),
  deviceId: z.string().min(8).max(200),
  deviceName: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Outlet atau PIN tidak valid");
    }
    const input = parsed.data;

    const business = await prisma.business.findFirst({
      where: {
        storeCode: {
          equals: input.storeCode.toUpperCase(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        ownerId: true,
        owner: { select: { email: true } },
      },
    });
    if (!business) {
      throw new MobileApiError(404, "STORE_CODE_NOT_FOUND", "Kode toko tidak ditemukan");
    }

    const outlet = await prisma.outlet.findFirst({
      where: {
        id: input.outletId,
        businessId: business.id,
        isActive: true,
      },
      select: { id: true },
    });
    if (!outlet) {
      throw new MobileApiError(403, "OUTLET_ACCESS_DENIED", "Outlet tidak tersedia untuk kode toko ini");
    }

    const assignments = await prisma.employeeOutlet.findMany({
      where: { outletId: outlet.id },
      select: {
        employee: {
          include: { role: true },
        },
      },
      orderBy: { employee: { name: "asc" } },
    });

    let cashier: (typeof assignments)[number]["employee"] | null = null;
    for (const assignment of assignments) {
      const employee = assignment.employee;
      if (!employee.isActive || !employee.pin) continue;
      if (!(await verifyEmployeePin(employee.id, employee.pin, input.pin))) continue;
      if (!employee.role.permissions.includes("pos.access")) {
        throw new MobileApiError(403, "CASHIER_ACCESS_DENIED", "Akun ini tidak memiliki akses POS");
      }
      cashier = employee;
      break;
    }

    if (!cashier) {
      throw new MobileApiError(401, "INVALID_PIN", "PIN tidak valid untuk outlet ini");
    }

    const sessionUserId = cashier.userId ?? business.ownerId;
    const refreshToken = newRefreshToken();
    const session = await prisma.$transaction(async (tx) => {
      await tx.mobileSession.updateMany({
        where: {
          businessId: business.id,
          deviceId: input.deviceId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      return tx.mobileSession.create({
        data: {
          userId: sessionUserId,
          businessId: business.id,
          employeeId: cashier.id,
          selectedOutletId: outlet.id,
          deviceId: input.deviceId,
          deviceName: input.deviceName,
          refreshTokenHash: hashRefreshToken(refreshToken),
          expiresAt: refreshExpiry(),
        },
      });
    });

    const [accessToken, entitlement] = await Promise.all([
      issueAccessToken({
        sessionId: session.id,
        userId: sessionUserId,
        businessId: business.id,
        employeeId: cashier.id,
        deviceId: input.deviceId,
        outletId: outlet.id,
      }),
      getEntitlement({
        businessId: business.id,
        sessionId: session.id,
        deviceId: input.deviceId,
      }),
    ]);

    return noStoreJson({
      accessToken,
      refreshToken,
      user: {
        id: cashier.id,
        businessId: business.id,
        name: cashier.name,
        email: cashier.email ?? business.owner.email,
        role: cashier.role.name,
        permissions: cashier.role.permissions,
      },
      entitlement,
      offlineCredential: createOfflinePinCredential(cashier.id, input.pin),
    });
  } catch (error) {
    return apiError(error);
  }
}
