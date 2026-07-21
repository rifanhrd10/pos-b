import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const OFFLINE_PIN_ITERATIONS = 120_000;

export type OfflinePinCredential = {
  algorithm: "PBKDF2WithHmacSHA256";
  employeeId: string;
  salt: string;
  hash: string;
  iterations: number;
};

export function createOfflinePinCredential(
  employeeId: string,
  pin: string
): OfflinePinCredential {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(pin, salt, OFFLINE_PIN_ITERATIONS, 32, "sha256");
  return {
    algorithm: "PBKDF2WithHmacSHA256",
    employeeId,
    salt: salt.toString("base64url"),
    hash: hash.toString("base64url"),
    iterations: OFFLINE_PIN_ITERATIONS,
  };
}

export function verifyOfflinePinCredential(pin: string, credential: OfflinePinCredential) {
  const actual = pbkdf2Sync(
    pin,
    Buffer.from(credential.salt, "base64url"),
    credential.iterations,
    32,
    "sha256"
  );
  return timingSafeEqual(actual, Buffer.from(credential.hash, "base64url"));
}

export async function verifyEmployeePin(employeeId: string, storedPin: string, pin: string) {
  if (storedPin.startsWith("$2")) return bcrypt.compare(pin, storedPin);

  const stored = Buffer.from(storedPin);
  const entered = Buffer.from(pin);
  const valid = stored.length === entered.length && timingSafeEqual(stored, entered);
  if (valid) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { pin: await bcrypt.hash(pin, 10) },
    });
  }
  return valid;
}
