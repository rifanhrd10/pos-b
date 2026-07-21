ALTER TABLE "StockMovement" ADD COLUMN "stockBefore" INTEGER;
ALTER TABLE "StockMovement" ADD COLUMN "stockAfter" INTEGER;

ALTER TABLE "Customer" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Customer" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Customer_businessId_isActive_idx" ON "Customer"("businessId", "isActive");
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
