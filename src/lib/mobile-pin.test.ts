import assert from "node:assert/strict";
import test from "node:test";
import { createOfflinePinCredential, verifyOfflinePinCredential } from "./mobile-pin";

test("offline PIN credential accepts the enrolled PIN", () => {
  const credential = createOfflinePinCredential("employee-1", "2468");
  assert.equal(verifyOfflinePinCredential("2468", credential), true);
});

test("offline PIN credential rejects a different PIN", () => {
  const credential = createOfflinePinCredential("employee-1", "2468");
  assert.equal(verifyOfflinePinCredential("1357", credential), false);
});
