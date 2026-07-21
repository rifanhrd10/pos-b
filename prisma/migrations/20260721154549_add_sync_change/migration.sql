-- DropIndex
DROP INDEX "Customer_businessId_isActive_idx";

-- DropIndex
DROP INDEX "StockMovement_createdAt_idx";

-- AlterTable
ALTER TABLE "MasterVariantOption" ALTER COLUMN "updatedAt" DROP DEFAULT;

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
CREATE INDEX "SyncChange_businessId_sequence_idx" ON "SyncChange"("businessId", "sequence");

-- CreateIndex
CREATE INDEX "SyncChange_entityType_entityId_idx" ON "SyncChange"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "SyncChange" ADD CONSTRAINT "SyncChange_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
