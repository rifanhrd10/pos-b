import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import {
  hashRefreshToken,
  issueAccessToken,
  newRefreshToken,
  refreshExpiry,
} from "@/lib/mobile-auth";
import { getEntitlement } from "@/lib/mobile-subscription";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
  deviceId: z.string().min(8).max(200),
  deviceName: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Data login tidak valid", parsed.error.flatten());
    }

    const input = parsed.data;
    const user = await prisma.user.findFirst({
      where: { email: { equals: input.email.trim(), mode: "insensitive" } },
      include: {
        employees: {
          where: { isActive: true },
          include: {
            role: true,
            outlets: { include: { outlet: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new MobileApiError(401, "INVALID_CREDENTIALS", "Email atau password salah");
    }
    if (user.role === "itadmin") {
      throw new MobileApiError(403, "POS_ACCESS_DENIED", "Akun IT admin tidak dapat digunakan sebagai kasir");
    }

    const employee = user.employees.find(
      (item) => item.role.permissions.includes("pos.access") && item.outlets.some((row) => row.outlet.isActive)
    );
    if (!employee) {
      throw new MobileApiError(403, "POS_ACCESS_DENIED", "Akun belum memiliki akses POS dan outlet aktif");
    }

    const refreshToken = newRefreshToken();
    const session = await prisma.$transaction(async (tx) => {
      await tx.mobileSession.updateMany({
        where: {
          userId: user.id,
          businessId: employee.businessId,
          deviceId: input.deviceId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      return tx.mobileSession.create({
        data: {
          userId: user.id,
          businessId: employee.businessId,
          employeeId: employee.id,
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
        userId: user.id,
        businessId: employee.businessId,
        employeeId: employee.id,
        deviceId: input.deviceId,
      }),
      getEntitlement({
        businessId: employee.businessId,
        sessionId: session.id,
        deviceId: input.deviceId,
      }),
    ]);

    return noStoreJson({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        businessId: employee.businessId,
        name: employee.name || user.name,
        email: user.email,
        role: employee.role.name,
        permissions: employee.role.permissions,
      },
      entitlement,
    });
  } catch (error) {
    return apiError(error);
  }
}
