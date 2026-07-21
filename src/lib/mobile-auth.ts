import { createHash, randomBytes } from "crypto";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { MobileApiError } from "@/lib/mobile-api";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ISSUER = "bayaro-pos-api";
const AUDIENCE = "bayaro-pos-android";

function signingKey() {
  const secret = process.env.MOBILE_AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("MOBILE_AUTH_SECRET atau AUTH_SECRET minimal 32 karakter wajib diatur");
  }
  return new TextEncoder().encode(secret);
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newRefreshToken() {
  return randomBytes(32).toString("base64url");
}

export function refreshExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}

export async function issueAccessToken(input: {
  sessionId: string;
  userId: string;
  businessId: string;
  employeeId: string;
  deviceId: string;
  outletId?: string | null;
}) {
  return new SignJWT({
    sid: input.sessionId,
    businessId: input.businessId,
    employeeId: input.employeeId,
    deviceId: input.deviceId,
    ...(input.outletId ? { outletId: input.outletId } : {}),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(input.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(signingKey());
}

export type MobileAuthContext = {
  sessionId: string;
  userId: string;
  businessId: string;
  employeeId: string;
  deviceId: string;
  selectedOutletId: string | null;
  user: { id: string; name: string; email: string };
  employee: {
    id: string;
    name: string;
    role: { name: string; permissions: string[] };
    outlets: { outlet: { id: string; name: string; isActive: boolean } }[];
  };
  permissions: string[];
  outletIds: string[];
};

export async function authenticateMobile(request: NextRequest): Promise<MobileAuthContext> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new MobileApiError(401, "AUTH_REQUIRED", "Token akses diperlukan");
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(authorization.slice(7), signingKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    }));
  } catch {
    throw new MobileApiError(401, "INVALID_ACCESS_TOKEN", "Token akses tidak valid atau kedaluwarsa");
  }

  const sessionId = typeof payload.sid === "string" ? payload.sid : "";
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const businessId = typeof payload.businessId === "string" ? payload.businessId : "";
  const employeeId = typeof payload.employeeId === "string" ? payload.employeeId : "";
  const deviceId = typeof payload.deviceId === "string" ? payload.deviceId : "";
  const tokenOutletId = typeof payload.outletId === "string" ? payload.outletId : null;
  if (!sessionId || !userId || !businessId || !employeeId || !deviceId) {
    throw new MobileApiError(401, "INVALID_ACCESS_TOKEN", "Isi token akses tidak valid");
  }

  const session = await prisma.mobileSession.findUnique({
    where: { id: sessionId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      employee: {
        include: {
          role: { select: { name: true, permissions: true } },
          outlets: { include: { outlet: { select: { id: true, name: true, isActive: true } } } },
        },
      },
    },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.userId !== userId ||
    session.businessId !== businessId ||
    session.employeeId !== employeeId ||
    session.deviceId !== deviceId ||
    (session.selectedOutletId ?? null) !== tokenOutletId ||
    !session.employee?.isActive
  ) {
    throw new MobileApiError(401, "SESSION_EXPIRED", "Sesi perangkat tidak aktif");
  }

  const permissions = session.employee.role.permissions;
  if (!permissions.includes("pos.access")) {
    throw new MobileApiError(403, "POS_ACCESS_DENIED", "Akun tidak memiliki akses POS");
  }

  const activeEmployeeOutletIds = session.employee.outlets
    .filter((row) => row.outlet.isActive)
    .map((row) => row.outlet.id);
  if (session.selectedOutletId && !activeEmployeeOutletIds.includes(session.selectedOutletId)) {
    throw new MobileApiError(403, "OUTLET_ACCESS_DENIED", "Kasir tidak lagi memiliki akses ke outlet perangkat");
  }

  await prisma.mobileSession.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  });

  return {
    sessionId,
    userId,
    businessId,
    employeeId,
    deviceId,
    selectedOutletId: session.selectedOutletId,
    user: session.user,
    employee: session.employee,
    permissions,
    outletIds: session.selectedOutletId ? [session.selectedOutletId] : activeEmployeeOutletIds,
  };
}

export async function requireDeviceAdministrator(context: MobileAuthContext) {
  const activator = await prisma.employee.findFirst({
    where: {
      businessId: context.businessId,
      userId: context.userId,
      isActive: true,
    },
    include: { role: true },
  });
  const permissions = activator?.role.permissions ?? [];
  if (!permissions.includes("employees.manage") && !permissions.includes("outlets.manage")) {
    throw new MobileApiError(
      403,
      "DEVICE_ACTIVATION_DENIED",
      "Aktivasi perangkat hanya dapat dilakukan oleh Admin atau Owner"
    );
  }
  return activator!;
}

export function requireOutlet(context: MobileAuthContext, outletId: string) {
  if (!context.outletIds.includes(outletId)) {
    throw new MobileApiError(403, "OUTLET_ACCESS_DENIED", "Kasir tidak memiliki akses ke outlet ini");
  }
}
