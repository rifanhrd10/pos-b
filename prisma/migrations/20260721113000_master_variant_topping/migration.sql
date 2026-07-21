CREATE TABLE "MasterVariant" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterTopping" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTopping_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductVariant" ADD COLUMN "masterVariantId" TEXT;
ALTER TABLE "ProductTopping" ADD COLUMN "masterToppingId" TEXT;

CREATE UNIQUE INDEX "MasterVariant_businessId_name_optionName_key" ON "MasterVariant"("businessId", "name", "optionName");
CREATE INDEX "MasterVariant_businessId_isActive_idx" ON "MasterVariant"("businessId", "isActive");
CREATE UNIQUE INDEX "MasterTopping_businessId_name_key" ON "MasterTopping"("businessId", "name");
CREATE INDEX "MasterTopping_businessId_isActive_idx" ON "MasterTopping"("businessId", "isActive");

ALTER TABLE "MasterVariant" ADD CONSTRAINT "MasterVariant_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MasterTopping" ADD CONSTRAINT "MasterTopping_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_masterVariantId_fkey" FOREIGN KEY ("masterVariantId") REFERENCES "MasterVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductTopping" ADD CONSTRAINT "ProductTopping_masterToppingId_fkey" FOREIGN KEY ("masterToppingId") REFERENCES "MasterTopping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "MasterVariant" ("id", "businessId", "name", "optionName", "priceAdjustment", "isActive", "createdAt", "updatedAt")
SELECT
  CONCAT('mv_', md5(CONCAT(p."businessId", '|', 'Varian', '|', pv."name", '|', pv."priceAdjustment"::text))),
  p."businessId",
  'Varian',
  pv."name",
  pv."priceAdjustment",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ProductVariant" pv
JOIN "Product" p ON p."id" = pv."productId"
ON CONFLICT ("businessId", "name", "optionName") DO NOTHING;

UPDATE "ProductVariant" pv
SET "masterVariantId" = mv."id"
FROM "Product" p, "MasterVariant" mv
WHERE p."id" = pv."productId"
  AND mv."businessId" = p."businessId"
  AND mv."name" = 'Varian'
  AND mv."optionName" = pv."name";

INSERT INTO "MasterTopping" ("id", "businessId", "name", "price", "isActive", "createdAt", "updatedAt")
SELECT
  CONCAT('mt_', md5(CONCAT(p."businessId", '|', pt."name", '|', pt."price"::text))),
  p."businessId",
  pt."name",
  pt."price",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ProductTopping" pt
JOIN "Product" p ON p."id" = pt."productId"
ON CONFLICT ("businessId", "name") DO NOTHING;

UPDATE "ProductTopping" pt
SET "masterToppingId" = mt."id"
FROM "Product" p, "MasterTopping" mt
WHERE p."id" = pt."productId"
  AND mt."businessId" = p."businessId"
  AND mt."name" = pt."name";
