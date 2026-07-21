-- Merge Android/mobile API persistence into the main pos-b repository.
-- This migration is intentionally defensive because some staging databases may
-- already contain part of the mobile sync objects from earlier API experiments.

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileSession_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MobileSession"
ADD COLUMN IF NOT EXISTS "selectedOutletId" TEXT;

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

CREATE TABLE IF NOT EXISTS "SyncChange" (
    "sequence" BIGSERIAL NOT NULL,
    "businessId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncChange_pkey" PRIMARY KEY ("sequence")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MobileSession_refreshTokenHash_key" ON "MobileSession"("refreshTokenHash");
CREATE INDEX IF NOT EXISTS "MobileSession_userId_businessId_idx" ON "MobileSession"("userId", "businessId");
CREATE INDEX IF NOT EXISTS "MobileSession_deviceId_idx" ON "MobileSession"("deviceId");
CREATE INDEX IF NOT EXISTS "MobileSession_selectedOutletId_idx" ON "MobileSession"("selectedOutletId");
CREATE INDEX IF NOT EXISTS "MobileSession_expiresAt_idx" ON "MobileSession"("expiresAt");
CREATE INDEX IF NOT EXISTS "SyncMutation_businessId_createdAt_idx" ON "SyncMutation"("businessId", "createdAt");
CREATE INDEX IF NOT EXISTS "SyncMutation_entityType_entityId_idx" ON "SyncMutation"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "SyncChange_businessId_sequence_idx" ON "SyncChange"("businessId", "sequence");
CREATE INDEX IF NOT EXISTS "SyncChange_entityType_entityId_idx" ON "SyncChange"("entityType", "entityId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobileSession_userId_fkey') THEN
        ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobileSession_businessId_fkey') THEN
        ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobileSession_employeeId_fkey') THEN
        ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SyncMutation_businessId_fkey') THEN
        ALTER TABLE "SyncMutation" ADD CONSTRAINT "SyncMutation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SyncMutation_sessionId_fkey') THEN
        ALTER TABLE "SyncMutation" ADD CONSTRAINT "SyncMutation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MobileSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SyncChange_businessId_fkey') THEN
        ALTER TABLE "SyncChange" ADD CONSTRAINT "SyncChange_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION "record_mobile_sync_change"()
RETURNS TRIGGER AS $$
DECLARE
    source_row RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN
        source_row := OLD;
    ELSE
        source_row := NEW;
    END IF;

    INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
    VALUES (source_row."businessId", TG_ARGV[0], source_row."id", lower(TG_OP), CURRENT_TIMESTAMP);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Category_mobile_sync_change" ON "Category";
CREATE TRIGGER "Category_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Category"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('category');

DROP TRIGGER IF EXISTS "Product_mobile_sync_change" ON "Product";
CREATE TRIGGER "Product_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Product"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('product');

DROP TRIGGER IF EXISTS "Outlet_mobile_sync_change" ON "Outlet";
CREATE TRIGGER "Outlet_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Outlet"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('outlet');

DROP TRIGGER IF EXISTS "Customer_mobile_sync_change" ON "Customer";
CREATE TRIGGER "Customer_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Customer"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('customer');

DROP TRIGGER IF EXISTS "Table_mobile_sync_change" ON "Table";
CREATE TRIGGER "Table_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Table"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('table');

DROP TRIGGER IF EXISTS "PaymentMethod_mobile_sync_change" ON "PaymentMethod";
CREATE TRIGGER "PaymentMethod_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "PaymentMethod"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('paymentMethod');

DROP TRIGGER IF EXISTS "Subscription_mobile_sync_change" ON "Subscription";
CREATE TRIGGER "Subscription_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Subscription"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('entitlement');

CREATE OR REPLACE FUNCTION "record_mobile_product_child_change"()
RETURNS TRIGGER AS $$
DECLARE
    source_row RECORD;
    target_business_id TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        source_row := OLD;
    ELSE
        source_row := NEW;
    END IF;

    SELECT "businessId" INTO target_business_id FROM "Product" WHERE "id" = source_row."productId";
    IF target_business_id IS NOT NULL THEN
        INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
        VALUES (target_business_id, 'product', source_row."productId", 'update', CURRENT_TIMESTAMP);
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "ProductVariant_mobile_sync_change" ON "ProductVariant";
CREATE TRIGGER "ProductVariant_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "ProductVariant"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_product_child_change"();

DROP TRIGGER IF EXISTS "ProductTopping_mobile_sync_change" ON "ProductTopping";
CREATE TRIGGER "ProductTopping_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "ProductTopping"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_product_child_change"();

DROP TRIGGER IF EXISTS "ProductVariantGroup_mobile_sync_change" ON "ProductVariantGroup";
CREATE TRIGGER "ProductVariantGroup_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "ProductVariantGroup"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_product_child_change"();

CREATE OR REPLACE FUNCTION "record_mobile_variant_option_change"()
RETURNS TRIGGER AS $$
DECLARE
    source_row RECORD;
    affected_product RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN source_row := OLD; ELSE source_row := NEW; END IF;

    FOR affected_product IN
        SELECT DISTINCT p."id" AS "productId", p."businessId"
        FROM "ProductVariantGroup" pvg
        JOIN "Product" p ON p."id" = pvg."productId"
        WHERE pvg."masterVariantId" = source_row."masterVariantId"
    LOOP
        INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
        VALUES (affected_product."businessId", 'product', affected_product."productId", 'update', CURRENT_TIMESTAMP);
    END LOOP;

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "MasterVariantOption_mobile_sync_change" ON "MasterVariantOption";
CREATE TRIGGER "MasterVariantOption_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "MasterVariantOption"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_variant_option_change"();

CREATE OR REPLACE FUNCTION "record_mobile_master_variant_change"()
RETURNS TRIGGER AS $$
DECLARE
    source_row RECORD;
    affected_product RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN source_row := OLD; ELSE source_row := NEW; END IF;

    FOR affected_product IN
        SELECT DISTINCT p."id" AS "productId", p."businessId"
        FROM "ProductVariantGroup" pvg
        JOIN "Product" p ON p."id" = pvg."productId"
        WHERE pvg."masterVariantId" = source_row."id"
    LOOP
        INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
        VALUES (affected_product."businessId", 'product', affected_product."productId", 'update', CURRENT_TIMESTAMP);
    END LOOP;

    INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
    VALUES (source_row."businessId", 'masterVariant', source_row."id", lower(TG_OP), CURRENT_TIMESTAMP);

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "MasterVariant_mobile_sync_change" ON "MasterVariant";
CREATE TRIGGER "MasterVariant_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "MasterVariant"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_master_variant_change"();

CREATE OR REPLACE FUNCTION "record_mobile_master_topping_change"()
RETURNS TRIGGER AS $$
DECLARE
    source_row RECORD;
    affected_product RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN source_row := OLD; ELSE source_row := NEW; END IF;

    FOR affected_product IN
        SELECT DISTINCT p."id" AS "productId", p."businessId"
        FROM "ProductTopping" pt
        JOIN "Product" p ON p."id" = pt."productId"
        WHERE pt."masterToppingId" = source_row."id"
    LOOP
        INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
        VALUES (affected_product."businessId", 'product', affected_product."productId", 'update', CURRENT_TIMESTAMP);
    END LOOP;

    INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
    VALUES (source_row."businessId", 'masterTopping', source_row."id", lower(TG_OP), CURRENT_TIMESTAMP);

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "MasterTopping_mobile_sync_change" ON "MasterTopping";
CREATE TRIGGER "MasterTopping_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "MasterTopping"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_master_topping_change"();

CREATE OR REPLACE FUNCTION "record_mobile_stock_change"()
RETURNS TRIGGER AS $$
DECLARE
    source_row RECORD;
    target_business_id TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN source_row := OLD; ELSE source_row := NEW; END IF;
    SELECT "businessId" INTO target_business_id FROM "Outlet" WHERE "id" = source_row."outletId";
    IF target_business_id IS NOT NULL THEN
        INSERT INTO "SyncChange" ("businessId", "entityType", "entityId", "operation", "createdAt")
        VALUES (target_business_id, 'product', source_row."productId", 'update', CURRENT_TIMESTAMP);
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Stock_mobile_sync_change" ON "Stock";
CREATE TRIGGER "Stock_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Stock"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_stock_change"();
