const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedLogs() {
  console.log("Seeding Activity Logs...");

  // Get the demo business
  const business = await prisma.business.findFirst({
    where: { name: "Bayaro Coffee Demo" }
  });

  if (!business) {
    console.error("Demo business not found. Run seed-payment.js first or ensure DB has data.");
    return;
  }

  const itAdminUser = await prisma.user.findFirst({
    where: { role: "itadmin" }
  });

  const tenantOwner = await prisma.user.findFirst({
    where: { id: business.ownerId }
  });

  const now = new Date();

  const logs = [
    {
      action: "VOID_ORDER",
      businessId: business.id,
      userId: tenantOwner ? tenantOwner.id : null,
      userName: "Kasir Utama (John Doe)",
      entityType: "ORDER",
      entityId: "TRX-1029",
      details: { orderNumber: "TRX-1029", reason: "Customer cancel (salah pesan)", authorizedBy: "Manager" },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      action: "ADJUST_STOCK",
      businessId: business.id,
      userId: tenantOwner ? tenantOwner.id : null,
      userName: tenantOwner ? tenantOwner.name : "Owner Bayaro",
      entityType: "STOCK",
      entityId: "STK-111",
      details: { productId: "PROD-ABC", type: "OUT", quantity: 5, note: "Barang expired", newStock: 45 },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      action: "DELETE_PRODUCT",
      businessId: business.id,
      userId: tenantOwner ? tenantOwner.id : null,
      userName: tenantOwner ? tenantOwner.name : "Owner Bayaro",
      entityType: "PRODUCT",
      entityId: "PROD-999",
      details: { productName: "Kopi Gula Aren (Old Ver)" },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48) // 2 days ago
    },
    {
      action: "APPROVE_PAYMENT",
      businessId: null, // IT Admin System Log
      userId: itAdminUser ? itAdminUser.id : null,
      userName: itAdminUser ? itAdminUser.name : "IT Admin",
      entityType: "SUBSCRIPTION",
      entityId: business.id,
      details: { plan: "Pro Plan", status: "active", duration: 1, tenant: business.name },
      createdAt: new Date(now.getTime() - 1000 * 60 * 30) // 30 mins ago
    },
    {
      action: "REQUEST_RENEWAL",
      businessId: business.id,
      userId: tenantOwner ? tenantOwner.id : null,
      userName: tenantOwner ? tenantOwner.name : "Owner Bayaro",
      entityType: "PAYMENT_REQUEST",
      entityId: "REQ-123",
      details: { method: "Manual Transfer", amount: 150000 },
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5) // 5 hours ago
    }
  ];

  for (const log of logs) {
    await prisma.activityLog.create({
      data: log
    });
  }

  console.log("Seeded 5 dummy activity logs successfully!");
}

seedLogs()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
