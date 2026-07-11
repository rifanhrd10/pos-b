-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "storeCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_storeCode_key" ON "Business"("storeCode");
