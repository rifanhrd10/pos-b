import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import {
  hashRefreshToken,
  issueAccessToken,
  newRefreshToken,
  refreshExpiry,
} from "@/lib/mobile-auth";

export const runtime = "nodejs";

const schema = z.object({
  refreshToken: z.string().min(32).max(500),
  deviceId: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new MobileApiError(422, "VALIDATION_ERROR", "Data refresh token tidak valid");

    const session = await prisma.mobileSession.findUnique({
      where: { refreshTokenHash: hashRefreshToken(parsed.data.refreshToken) },
      include: { employee: { include: { role: true } } },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.deviceId !== parsed.data.deviceId ||
      !session.employee?.isActive ||
      !session.employee.role.permissions.includes("pos.access")
    ) {
      throw new MobileApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token tidak valid atau kedaluwarsa");
    }

    const refreshToken = newRefreshToken();
    await prisma.mobileSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshExpiry(),
        lastSeenAt: new Date(),
      },
    });
    const accessToken = await issueAccessToken({
      sessionId: session.id,
      userId: session.userId,
      businessId: session.businessId,
      employeeId: session.employee.id,
      deviceId: session.deviceId,
    });

    return noStoreJson({ accessToken, refreshToken });
  } catch (error) {
    return apiError(error);
  }
}
