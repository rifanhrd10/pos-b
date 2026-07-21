-- Convert MasterVariant from "one row = one option" into
-- "one row = variant group" + MasterVariantOption detail rows.

CREATE TABLE "MasterVariantOption" (
    "id" TEXT NOT NULL,
    "masterVariantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterVariantOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariantGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "masterVariantId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItemVariant" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "masterVariantId" TEXT,
    "masterVariantOptionId" TEXT,
    "groupName" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "OrderItemVariant_pkey" PRIMARY KEY ("id")
);

WITH grouped AS (
  SELECT
    "businessId",
    "name",
    MIN("id") AS "groupId"
  FROM "MasterVariant"
  GROUP BY "businessId", "name"
),
options AS (
  SELECT
    mv."id",
    g."groupId",
    mv."optionName",
    mv."priceAdjustment",
    mv."isActive",
    mv."createdAt",
    mv."updatedAt",
    ROW_NUMBER() OVER (PARTITION BY mv."businessId", mv."name" ORDER BY mv."optionName", mv."id") - 1 AS "sortOrder"
  FROM "MasterVariant" mv
  JOIN grouped g ON g."businessId" = mv."businessId" AND g."name" = mv."name"
)
INSERT INTO "MasterVariantOption" ("id", "masterVariantId", "name", "priceAdjustment", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT
  "id",
  "groupId",
  "optionName",
  "priceAdjustment",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
FROM options
ON CONFLICT ("id") DO NOTHING;

WITH grouped AS (
  SELECT
    "businessId",
    "name",
    MIN("id") AS "groupId"
  FROM "MasterVariant"
  GROUP BY "businessId", "name"
)
INSERT INTO "ProductVariantGroup" ("id", "productId", "masterVariantId", "isRequired", "sortOrder", "createdAt")
SELECT DISTINCT
  CONCAT('pvg_', md5(CONCAT(pv."productId", '|', g."groupId"))),
  pv."productId",
  g."groupId",
  true,
  MIN(pv."sortOrder") OVER (PARTITION BY pv."productId", g."groupId"),
  CURRENT_TIMESTAMP
FROM "ProductVariant" pv
JOIN "MasterVariant" mv ON mv."id" = pv."masterVariantId"
JOIN grouped g ON g."businessId" = mv."businessId" AND g."name" = mv."name"
WHERE pv."masterVariantId" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "ProductVariant" DROP CONSTRAINT IF EXISTS "ProductVariant_masterVariantId_fkey";
ALTER TABLE "ProductVariant" DROP COLUMN IF EXISTS "masterVariantId";

WITH grouped AS (
  SELECT
    "businessId",
    "name",
    MIN("id") AS "groupId"
  FROM "MasterVariant"
  GROUP BY "businessId", "name"
)
DELETE FROM "MasterVariant" mv
USING grouped g
WHERE mv."businessId" = g."businessId"
  AND mv."name" = g."name"
  AND mv."id" <> g."groupId";

DROP INDEX IF EXISTS "MasterVariant_businessId_name_optionName_key";
ALTER TABLE "MasterVariant" DROP COLUMN IF EXISTS "optionName";
ALTER TABLE "MasterVariant" DROP COLUMN IF EXISTS "priceAdjustment";
CREATE UNIQUE INDEX "MasterVariant_businessId_name_key" ON "MasterVariant"("businessId", "name");

CREATE UNIQUE INDEX "MasterVariantOption_masterVariantId_name_key" ON "MasterVariantOption"("masterVariantId", "name");
CREATE INDEX "MasterVariantOption_masterVariantId_isActive_idx" ON "MasterVariantOption"("masterVariantId", "isActive");
CREATE UNIQUE INDEX "ProductVariantGroup_productId_masterVariantId_key" ON "ProductVariantGroup"("productId", "masterVariantId");
CREATE INDEX "ProductVariantGroup_masterVariantId_idx" ON "ProductVariantGroup"("masterVariantId");
CREATE INDEX "OrderItemVariant_orderItemId_idx" ON "OrderItemVariant"("orderItemId");
CREATE INDEX "OrderItemVariant_masterVariantOptionId_idx" ON "OrderItemVariant"("masterVariantOptionId");

ALTER TABLE "MasterVariantOption" ADD CONSTRAINT "MasterVariantOption_masterVariantId_fkey" FOREIGN KEY ("masterVariantId") REFERENCES "MasterVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_masterVariantId_fkey" FOREIGN KEY ("masterVariantId") REFERENCES "MasterVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItemVariant" ADD CONSTRAINT "OrderItemVariant_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItemVariant" ADD CONSTRAINT "OrderItemVariant_masterVariantOptionId_fkey" FOREIGN KEY ("masterVariantOptionId") REFERENCES "MasterVariantOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
