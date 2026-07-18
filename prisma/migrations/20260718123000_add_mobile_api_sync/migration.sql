-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "graceEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MobileSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "employeeId" TEXT,
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

-- CreateTable
CREATE TABLE "SyncMutation" (
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

-- CreateTable
CREATE TABLE "SyncChange" (
    "sequence" BIGSERIAL NOT NULL,
    "businessId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncChange_pkey" PRIMARY KEY ("sequence")
);

-- CreateIndex
CREATE UNIQUE INDEX "MobileSession_refreshTokenHash_key" ON "MobileSession"("refreshTokenHash");
CREATE INDEX "MobileSession_userId_businessId_idx" ON "MobileSession"("userId", "businessId");
CREATE INDEX "MobileSession_deviceId_idx" ON "MobileSession"("deviceId");
CREATE INDEX "MobileSession_expiresAt_idx" ON "MobileSession"("expiresAt");
CREATE INDEX "SyncMutation_businessId_createdAt_idx" ON "SyncMutation"("businessId", "createdAt");
CREATE INDEX "SyncMutation_entityType_entityId_idx" ON "SyncMutation"("entityType", "entityId");
CREATE INDEX "SyncChange_businessId_sequence_idx" ON "SyncChange"("businessId", "sequence");
CREATE INDEX "SyncChange_entityType_entityId_idx" ON "SyncChange"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MobileSession" ADD CONSTRAINT "MobileSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SyncMutation" ADD CONSTRAINT "SyncMutation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncMutation" ADD CONSTRAINT "SyncMutation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MobileSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncChange" ADD CONSTRAINT "SyncChange_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Generic change-log trigger for tenant-owned master data.
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

CREATE TRIGGER "Category_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Category"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('category');

CREATE TRIGGER "Product_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Product"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('product');

CREATE TRIGGER "Outlet_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Outlet"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('outlet');

CREATE TRIGGER "Customer_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Customer"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('customer');

CREATE TRIGGER "Subscription_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Subscription"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('entitlement');

-- Product variants and toppings are synchronized as part of their parent product.
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

CREATE TRIGGER "ProductVariant_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "ProductVariant"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_product_child_change"();

CREATE TRIGGER "ProductTopping_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "ProductTopping"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_product_child_change"();

-- Stock belongs to a tenant through Outlet and is pulled as a product update.
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

CREATE TRIGGER "Stock_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Stock"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_stock_change"();
