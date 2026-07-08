-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'QRIS_STATIC', 'QRIS_DYNAMIC', 'BANK_TRANSFER', 'EWALLET');

-- CreateEnum
CREATE TYPE "QrisProvider" AS ENUM ('MIDTRANS', 'XENDIT', 'CUSTOM');

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "receiptHeader1" TEXT,
    "receiptHeader2" TEXT,
    "receiptHeader3" TEXT,
    "receiptFooter" TEXT,
    "receiptShowLogo" BOOLEAN NOT NULL DEFAULT true,
    "receiptShowAddress" BOOLEAN NOT NULL DEFAULT true,
    "receiptShowPhone" BOOLEAN NOT NULL DEFAULT true,
    "receiptShowKasir" BOOLEAN NOT NULL DEFAULT true,
    "receiptNumberFormat" TEXT NOT NULL DEFAULT 'TRX-{YYYYMMDD}-{SEQ}',
    "receiptThankYou" TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "language" TEXT NOT NULL DEFAULT 'id',
    "autoPrintReceipt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "qrisImage" TEXT,
    "qrisNote" TEXT,
    "provider" "QrisProvider",
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "apiEndpoint" TEXT,
    "merchantId" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "walletNumber" TEXT,
    "walletName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSettings_businessId_key" ON "BusinessSettings"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_businessId_type_name_key" ON "PaymentMethod"("businessId", "type", "name");

-- AddForeignKey
ALTER TABLE "BusinessSettings" ADD CONSTRAINT "BusinessSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
