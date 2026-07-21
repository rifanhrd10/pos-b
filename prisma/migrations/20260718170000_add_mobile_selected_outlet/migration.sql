ALTER TABLE "MobileSession"
ADD COLUMN "selectedOutletId" TEXT;

CREATE INDEX "MobileSession_selectedOutletId_idx"
ON "MobileSession"("selectedOutletId");
