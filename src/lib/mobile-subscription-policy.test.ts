import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_GRACE_MS, OFFLINE_TTL_MS, evaluateSubscription } from "./mobile-subscription-policy";

const now = Date.UTC(2026, 6, 18, 12, 0, 0);

test("active subscription gets a bounded three-day offline window", () => {
  const result = evaluateSubscription(
    { status: "active", trialEndsAt: null, currentPeriodEnd: null, graceEndsAt: null },
    now
  );
  assert.equal(result.status, "active");
  assert.equal(result.offlineValidUntil, now + OFFLINE_TTL_MS);
});

test("expired trial enters grace and is bounded by grace end", () => {
  const trialEnd = now - 60_000;
  const result = evaluateSubscription(
    { status: "trial", trialEndsAt: new Date(trialEnd), currentPeriodEnd: null, graceEndsAt: null },
    now
  );
  assert.equal(result.status, "grace");
  assert.equal(result.graceMs, trialEnd + DEFAULT_GRACE_MS);
  assert.equal(result.offlineValidUntil, trialEnd + DEFAULT_GRACE_MS);
});

test("subscription is blocked after its grace period", () => {
  const end = now - DEFAULT_GRACE_MS - 1;
  const result = evaluateSubscription(
    { status: "active", trialEndsAt: null, currentPeriodEnd: new Date(end), graceEndsAt: null },
    now
  );
  assert.equal(result.status, "expired");
  assert.equal(result.offlineValidUntil, now);
});

test("cancelled subscription cannot receive offline time", () => {
  const result = evaluateSubscription(
    {
      status: "cancelled",
      trialEndsAt: null,
      currentPeriodEnd: new Date(now + OFFLINE_TTL_MS),
      graceEndsAt: null,
    },
    now
  );
  assert.equal(result.status, "cancelled");
  assert.equal(result.offlineValidUntil, now);
});
