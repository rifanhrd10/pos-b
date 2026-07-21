-- Harden mobile API tables for production databases that may already have
-- partial objects from earlier Android API experiments.
-- This migration is additive-only and does not delete existing data.

ALTER TABLE "Subscription"
ADD COLUMN IF NOT EXISTS "graceEndsAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "MobileSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "employeeId" TEXT,
    "selectedOutletId" TEXT,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobileSession_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "employeeId" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "selectedOutletId" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "deviceId" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "deviceName" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "MobileSession" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "MobileSession_refreshTokenHash_key" ON "MobileSession"("refreshTokenHash");
CREATE INDEX IF NOT EXISTS "MobileSession_userId_businessId_idx" ON "MobileSession"("userId", "businessId");
CREATE INDEX IF NOT EXISTS "MobileSession_deviceId_idx" ON "MobileSession"("deviceId");
CREATE INDEX IF NOT EXISTS "MobileSession_selectedOutletId_idx" ON "MobileSession"("selectedOutletId");
CREATE INDEX IF NOT EXISTS "MobileSession_expiresAt_idx" ON "MobileSession"("expiresAt");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobileSession_userId_fkey') THEN
        ALTER TABLE "MobileSession"
        ADD CONSTRAINT "MobileSession_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobileSession_businessId_fkey') THEN
        ALTER TABLE "MobileSession"
        ADD CONSTRAINT "MobileSession_businessId_fkey"
        FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobileSession_employeeId_fkey') THEN
        ALTER TABLE "MobileSession"
        ADD CONSTRAINT "MobileSession_employeeId_fkey"
        FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SyncMutation" (
    "mutationId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "result" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "SyncMutation_pkey" PRIMARY KEY ("mutationId")
);

ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "mutationId" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "deviceId" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "entityType" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "entityId" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "operation" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "payload" JSONB;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'processing';
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "result" JSONB;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "errorCode" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SyncMutation" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "SyncMutation_businessId_createdAt_idx" ON "SyncMutation"("businessId", "createdAt");
CREATE INDEX IF NOT EXISTS "SyncMutation_entityType_entityId_idx" ON "SyncMutation"("entityType", "entityId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SyncMutation_businessId_fkey') THEN
        ALTER TABLE "SyncMutation"
        ADD CONSTRAINT "SyncMutation_businessId_fkey"
        FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SyncMutation_sessionId_fkey') THEN
        ALTER TABLE "SyncMutation"
        ADD CONSTRAINT "SyncMutation_sessionId_fkey"
        FOREIGN KEY ("sessionId") REFERENCES "MobileSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
