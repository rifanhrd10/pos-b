import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.paymentMethod.updateMany({
    data: { isActive: true },
  });

  await prisma.outletAddon.updateMany({
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
      expiredAt: null,
    },
  });

  console.log("Bayaro full access enabled: semua add-on dan metode pembayaran sudah aktif.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
