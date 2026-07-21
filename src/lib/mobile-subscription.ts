import { createHash } from "crypto";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { MobileApiError } from "@/lib/mobile-api";
import { evaluateSubscription } from "@/lib/mobile-subscription-policy";

const ISSUER = "bayaro-pos-api";
const AUDIENCE = "bayaro-pos-offline";

function signingKey() {
  const secret = process.env.MOBILE_AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("MOBILE_AUTH_SECRET atau AUTH_SECRET wajib diatur");
  }
  return createHash("sha256").update(secret).digest();
}

export type Entitlement = {
  businessId: string;
  planName: string;
  status: string;
  features: string[];
  subscriptionEndsAt: number | null;
  graceEndsAt: number | null;
  offlineValidUntil: number;
  signedLicense: string;
  serverTime: number;
};

export async function getEntitlement(input: {
  businessId: string;
  sessionId: string;
  deviceId: string;
}): Promise<Entitlement> {
  const subscription = await prisma.subscription.findUnique({
    where: { businessId: input.businessId },
    include: { plan: { select: { displayName: true, name: true, features: true } } },
  });
  const serverTime = Date.now();

  if (!subscription) {
    const signedLicense = await signOfflineLicense({
      ...input,
      status: "expired",
      offlineValidUntil: serverTime,
    });
    return {
      businessId: input.businessId,
      planName: "Tidak ada paket",
      status: "expired",
      features: [],
      subscriptionEndsAt: null,
      graceEndsAt: null,
      offlineValidUntil: serverTime,
      signedLicense,
      serverTime,
    };
  }

  const evaluated = evaluateSubscription(subscription);
  const signedLicense = await signOfflineLicense({
    ...input,
    status: evaluated.status,
    offlineValidUntil: evaluated.offlineValidUntil,
  });

  return {
    businessId: input.businessId,
    planName: subscription.plan.displayName || subscription.plan.name,
    status: evaluated.status,
    features: subscription.plan.features,
    subscriptionEndsAt: evaluated.endMs,
    graceEndsAt: evaluated.graceMs,
    offlineValidUntil: evaluated.offlineValidUntil,
    signedLicense,
    serverTime,
  };
}

async function signOfflineLicense(input: {
  businessId: string;
  sessionId: string;
  deviceId: string;
  status: string;
  offlineValidUntil: number;
}) {
  // JWT requires exp > iat. The signed claim still carries the exact entitlement cutoff.
  const expiration = Math.max(input.offlineValidUntil, Date.now() + 60_000);
  return new SignJWT({
    businessId: input.businessId,
    sid: input.sessionId,
    deviceId: input.deviceId,
    status: input.status,
    offlineValidUntil: input.offlineValidUntil,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(input.sessionId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiration / 1000))
    .sign(signingKey());
}

export async function verifyOfflineLicense(input: {
  token: string;
  businessId: string;
  sessionId: string;
  deviceId: string;
  clientCreatedAt: number;
}) {
  let payload;
  try {
    ({ payload } = await jwtVerify(input.token, signingKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      currentDate: new Date(input.clientCreatedAt),
    }));
  } catch {
    throw new MobileApiError(402, "OFFLINE_LICENSE_INVALID", "Lisensi offline tidak valid untuk waktu transaksi");
  }

  const issuedAt = (payload.iat ?? 0) * 1000;
  const offlineValidUntil =
    typeof payload.offlineValidUntil === "number" ? payload.offlineValidUntil : 0;
  const allowedStatus = ["active", "trial", "grace"].includes(String(payload.status));
  if (
    payload.businessId !== input.businessId ||
    payload.deviceId !== input.deviceId ||
    input.clientCreatedAt < issuedAt ||
    input.clientCreatedAt > offlineValidUntil ||
    !allowedStatus
  ) {
    throw new MobileApiError(402, "SUBSCRIPTION_EXPIRED", "Subscription tidak aktif pada saat transaksi dibuat");
  }
}

export function assertEntitlementAllowsSale(entitlement: Entitlement) {
  if (!["active", "trial", "grace"].includes(entitlement.status)) {
    throw new MobileApiError(402, "SUBSCRIPTION_EXPIRED", "Perpanjang subscription untuk membuat transaksi baru");
  }
}
