import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Plans (idempotent) ────────────────────────────────────
  const plans = [
    {
      name: "starter",
      displayName: "Starter",
      maxOutlets: 1,
      maxEmployees: 5,
      features: ["basic_reports"],
      price: 0,
    },
    {
      name: "pro",
      displayName: "Pro",
      maxOutlets: 10,
      maxEmployees: 50,
      features: ["shift", "advanced_reports", "export"],
      price: 199000,
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      maxOutlets: -1,
      maxEmployees: -1,
      features: ["shift", "advanced_reports", "export", "api", "priority_support"],
      price: 599000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`✓ Plan "${plan.displayName}" seeded`);
  }

  const proPlan = await prisma.plan.findUnique({ where: { name: "pro" } });

  // ── 2. Demo Admin User ───────────────────────────────────────
  const demoPassword = await bcrypt.hash("demo123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bayaro.id" },
    update: {},
    create: {
      email: "admin@bayaro.id",
      name: "Demo Admin",
      password: demoPassword,
      hasCompletedTour: true,
    },
  });
  console.log(`✓ User admin@bayaro.id seeded`);

  // ── 3. Demo Business ─────────────────────────────────────────
  let business = await prisma.business.findFirst({
    where: { ownerId: adminUser.id },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: adminUser.id,
        name: "Bayaro Coffee Demo",
        type: "COFFEE_SHOP",
        phone: "081234567890",
        email: "info@bayaro.id",
        address: "Jl. Sudirman No. 1",
        city: "Jakarta",
        province: "DKI Jakarta",
        taxRate: 10,
        serviceRate: 5,
        hasMultiOutlet: true,
        hasShift: true,
        onboardingStep: 5,
        onboardingDone: true,
      },
    });
  }
  console.log(`✓ Business "${business.name}" seeded`);

  // ── 4. Subscription ──────────────────────────────────────────
  if (proPlan) {
    await prisma.subscription.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        planId: proPlan.id,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ Subscription Pro seeded`);
  }

  // ── 5. Outlets ───────────────────────────────────────────────
  const outlet1 = await prisma.outlet.upsert({
    where: { id: `outlet-demo-1-${business.id}`.slice(0, 25) },
    update: {},
    create: {
      id: `outlet-demo-1-${business.id}`.slice(0, 25),
      businessId: business.id,
      name: "Outlet Pusat",
      address: "Jl. Sudirman No. 1",
      city: "Jakarta",
      phone: "021-1234567",
      isActive: true,
    },
  });

  const outlet2 = await prisma.outlet.upsert({
    where: { id: `outlet-demo-2-${business.id}`.slice(0, 25) },
    update: {},
    create: {
      id: `outlet-demo-2-${business.id}`.slice(0, 25),
      businessId: business.id,
      name: "Outlet Cabang",
      address: "Jl. Thamrin No. 5",
      city: "Jakarta",
      phone: "021-7654321",
      isActive: true,
    },
  });
  console.log(`✓ Outlets seeded`);

  // ── 6. Roles ─────────────────────────────────────────────────
  const allPermissions = [
    "dashboard.view",
    "products.view", "products.manage",
    "inventory.view", "inventory.manage",
    "employees.view", "employees.manage",
    "reports.view",
    "settings.manage",
    "pos.access",
    "pos.void",
    "promos.view", "promos.manage",
  ];

  const ownerRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Owner" } },
    update: {},
    create: {
      businessId: business.id,
      name: "Owner",
      description: "Akses penuh ke semua fitur",
      permissions: allPermissions,
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Manager" } },
    update: {},
    create: {
      businessId: business.id,
      name: "Manager",
      description: "Kelola operasional dan laporan",
      permissions: [
        "dashboard.view", "products.view", "products.manage",
        "inventory.view", "inventory.manage", "employees.view",
        "reports.view", "pos.access", "pos.void",
        "promos.view", "promos.manage",
      ],
      isSystem: true,
    },
  });

  const kasirRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Kasir" } },
    update: {},
    create: {
      businessId: business.id,
      name: "Kasir",
      description: "Akses POS dan transaksi",
      permissions: ["pos.access", "products.view", "inventory.view"],
      isSystem: true,
    },
  });
  console.log(`✓ Roles seeded`);

  // ── 7. Demo Manager User ─────────────────────────────────────
  const managerUser = await prisma.user.upsert({
    where: { email: "manager@bayaro.id" },
    update: {},
    create: {
      email: "manager@bayaro.id",
      name: "Demo Manager",
      password: demoPassword,
      hasCompletedTour: true,
    },
  });

  // ── 8. Demo Kasir User ───────────────────────────────────────
  const kasirUser = await prisma.user.upsert({
    where: { email: "kasir@bayaro.id" },
    update: {},
    create: {
      email: "kasir@bayaro.id",
      name: "Demo Kasir",
      password: demoPassword,
      hasCompletedTour: true,
    },
  });
  console.log(`✓ Users manager + kasir seeded`);

  // ── 9. Employees ─────────────────────────────────────────────
  const adminEmployee = await prisma.employee.upsert({
    where: { id: `emp-admin-${business.id}`.slice(0, 25) },
    update: {},
    create: {
      id: `emp-admin-${business.id}`.slice(0, 25),
      businessId: business.id,
      userId: adminUser.id,
      roleId: ownerRole.id,
      name: "Demo Admin",
      email: "admin@bayaro.id",
      pin: await bcrypt.hash("1234", 10),
      isActive: true,
    },
  });

  const managerEmployee = await prisma.employee.upsert({
    where: { id: `emp-mgr-${business.id}`.slice(0, 25) },
    update: {},
    create: {
      id: `emp-mgr-${business.id}`.slice(0, 25),
      businessId: business.id,
      userId: managerUser.id,
      roleId: managerRole.id,
      name: "Demo Manager",
      email: "manager@bayaro.id",
      pin: await bcrypt.hash("2222", 10),
      isActive: true,
    },
  });

  const kasirEmployee = await prisma.employee.upsert({
    where: { id: `emp-kasir-${business.id}`.slice(0, 25) },
    update: {},
    create: {
      id: `emp-kasir-${business.id}`.slice(0, 25),
      businessId: business.id,
      userId: kasirUser.id,
      roleId: kasirRole.id,
      name: "Demo Kasir",
      email: "kasir@bayaro.id",
      pin: await bcrypt.hash("3333", 10),
      isActive: true,
    },
  });
  console.log(`✓ Employees seeded`);

  // ── 10. EmployeeOutlet assignments ───────────────────────────
  for (const empId of [adminEmployee.id, managerEmployee.id]) {
    for (const outletId of [outlet1.id, outlet2.id]) {
      await prisma.employeeOutlet.upsert({
        where: { employeeId_outletId: { employeeId: empId, outletId } },
        update: {},
        create: { employeeId: empId, outletId },
      });
    }
  }
  await prisma.employeeOutlet.upsert({
    where: { employeeId_outletId: { employeeId: kasirEmployee.id, outletId: outlet1.id } },
    update: {},
    create: { employeeId: kasirEmployee.id, outletId: outlet1.id },
  });
  console.log(`✓ Employee-Outlet assignments seeded`);

  // ── 11. Business Settings ────────────────────────────────────
  await prisma.businessSettings.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      receiptHeader1: "Bayaro Coffee Demo",
      receiptThankYou: "Terima kasih telah berkunjung!",
      receiptShowLogo: true,
      receiptShowAddress: true,
      receiptShowPhone: true,
      receiptShowKasir: true,
    },
  });
  console.log(`✓ Business settings seeded`);

  // ── 12. Payment Methods ──────────────────────────────────────
  const paymentMethods = [
    { name: "Tunai", type: "CASH" as const, isEnabled: true },
    { name: "QRIS", type: "QRIS_STATIC" as const, isEnabled: true },
    { name: "Transfer Bank", type: "BANK_TRANSFER" as const, isEnabled: true },
  ];

  for (const pm of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { businessId: business.id, name: pm.name },
    });
    if (!existing) {
      await prisma.paymentMethod.create({
        data: { businessId: business.id, ...pm },
      });
    }
  }
  console.log(`✓ Payment methods seeded`);

  // ── 13. Categories ───────────────────────────────────────────
  const categories = [
    { name: "Kopi", icon: "☕" },
    { name: "Non-Kopi", icon: "🥤" },
    { name: "Makanan", icon: "🍽️" },
    { name: "Snack", icon: "🍪" },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { businessId: business.id, name: cat.name },
    });
    const c = existing ?? await prisma.category.create({
      data: { businessId: business.id, ...cat },
    });
    createdCategories[cat.name] = c.id;
  }
  console.log(`✓ Categories seeded`);

  // ── 14. Products ─────────────────────────────────────────────
  const products = [
    { name: "Espresso", basePrice: 25000, categoryKey: "Kopi" },
    { name: "Americano", basePrice: 28000, categoryKey: "Kopi" },
    { name: "Cappuccino", basePrice: 35000, categoryKey: "Kopi" },
    { name: "Latte", basePrice: 38000, categoryKey: "Kopi" },
    { name: "Matcha Latte", basePrice: 40000, categoryKey: "Non-Kopi" },
    { name: "Chocolate", basePrice: 35000, categoryKey: "Non-Kopi" },
    { name: "Es Teh", basePrice: 15000, categoryKey: "Non-Kopi" },
    { name: "Croissant", basePrice: 30000, categoryKey: "Makanan" },
    { name: "Sandwich", basePrice: 45000, categoryKey: "Makanan" },
    { name: "Cheesecake", basePrice: 40000, categoryKey: "Snack" },
    { name: "Cookies", basePrice: 20000, categoryKey: "Snack" },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { businessId: business.id, name: p.name },
    });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          businessId: business.id,
          name: p.name,
          basePrice: p.basePrice,
          categoryId: createdCategories[p.categoryKey],
          isActive: true,
        },
      });

      // Seed stock for both outlets
      for (const outletId of [outlet1.id, outlet2.id]) {
        await prisma.stock.create({
          data: {
            productId: product.id,
            outletId,
            quantity: Math.floor(Math.random() * 50) + 20,
          },
        });
      }
    }
  }
  console.log(`✓ Products + stock seeded`);

  // ── 15. Tables (untuk POS) ───────────────────────────────────
  const tableNames = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Bar 1", "Bar 2"];
  for (const tableName of tableNames) {
    const existing = await prisma.table.findFirst({
      where: { businessId: business.id, name: tableName },
    });
    if (!existing) {
      await prisma.table.create({
        data: {
          businessId: business.id,
          outletId: outlet1.id,
          name: tableName,
          capacity: 4,
          isActive: true,
        },
      });
    }
  }
  console.log(`✓ Tables seeded`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DEMO ACCOUNTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Admin   : admin@bayaro.id   / demo123
  Manager : manager@bayaro.id / demo123
  Kasir   : kasir@bayaro.id   / demo123

  POS PIN
  Admin   : 1234
  Manager : 2222
  Kasir   : 3333
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
