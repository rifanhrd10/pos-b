export const OFFLINE_TTL_MS = 3 * 24 * 60 * 60 * 1000;
export const DEFAULT_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export type SubscriptionWindow = {
  status: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  graceEndsAt: Date | null;
};

export function evaluateSubscription(subscription: SubscriptionWindow, now = Date.now()) {
  const configuredStatus = subscription.status.toLowerCase();
  const end = configuredStatus === "trial" ? subscription.trialEndsAt : subscription.currentPeriodEnd;
  const endMs = end?.getTime() ?? null;
  const graceMs = subscription.graceEndsAt?.getTime() ?? (endMs ? endMs + DEFAULT_GRACE_MS : null);

  let status = configuredStatus;
  if (["cancelled", "suspended", "expired"].includes(configuredStatus)) {
    status = configuredStatus;
  } else if (endMs !== null && now > endMs) {
    status = graceMs !== null && now <= graceMs ? "grace" : "expired";
  } else if (!["active", "trial", "grace"].includes(status)) {
    status = "expired";
  }

  const usableUntil = status === "grace" ? graceMs : endMs;
  const offlineValidUntil = ["active", "trial", "grace"].includes(status)
    ? Math.max(now, Math.min(now + OFFLINE_TTL_MS, usableUntil ?? now + OFFLINE_TTL_MS))
    : now;

  return { status, endMs, graceMs, offlineValidUntil };
}
