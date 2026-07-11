import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ═══════════════════════════════════════════════
  // PLANS
  // ═══════════════════════════════════════════════
  const plans = [
    {
      name: "starter", displayName: "Starter", maxOutlets: 1, maxEmployees: 5, price: 0,
      features: ["dashboard.view", "pos.access", "products.view", "products.manage", "inventory.view", "customers.view"],
    },
    {
      name: "pro", displayName: "Pro", maxOutlets: 10, maxEmployees: 50, price: 199000,
      features: [
        "dashboard.view", "pos.access", "products.view", "products.manage",
        "inventory.view", "inventory.manage", "employees.view", "employees.manage",
        "reports.view", "settings.manage", "promos.view", "promos.manage",
        "customers.view", "customers.manage", "shift.access", "multi_outlet", "export", "advanced_reports",
      ],
    },
    {
      name: "enterprise", displayName: "Enterprise", maxOutlets: -1, maxEmployees: -1, price: 599000,
      features: [
        "dashboard.view", "pos.access", "products.view", "products.manage",
        "inventory.view", "inventory.manage", "employees.view", "employees.manage",
        "reports.view", "settings.manage", "promos.view", "promos.manage",
        "customers.view", "customers.manage", "shift.access", "multi_outlet",
        "export", "advanced_reports", "api", "priority_support",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({ where: { name: plan.name }, update: plan, create: plan });
  }
  console.log("✓ Plans seeded");

  const proPlan = await prisma.plan.findUnique({ where: { name: "pro" } });

  // ═══════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════
  const demoPassword = await bcrypt.hash("demo123", 12);
  const itadminPassword = await bcrypt.hash("admin123", 12);

  // IT Admin user
  await prisma.user.upsert({
    where: { email: "itadmin@bayaro.id" },
    update: {},
    create: { email: "itadmin@bayaro.id", name: "IT Administrator", password: itadminPassword, role: "itadmin", hasCompletedTour: true },
  });
  console.log("✓ IT Admin seeded (itadmin@bayaro.id / admin123)");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bayaro.id" },
    update: {},
    create: { email: "admin@bayaro.id", name: "Demo Admin", password: demoPassword, hasCompletedTour: true },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@bayaro.id" },
    update: {},
    create: { email: "manager@bayaro.id", name: "Demo Manager", password: demoPassword, hasCompletedTour: true },
  });

  const kasirUser = await prisma.user.upsert({
    where: { email: "kasir@bayaro.id" },
    update: {},
    create: { email: "kasir@bayaro.id", name: "Demo Kasir", password: demoPassword, hasCompletedTour: true },
  });
  console.log("✓ Users seeded");

  // ═══════════════════════════════════════════════
  // BUSINESS
  // ═══════════════════════════════════════════════
  let business = await prisma.business.findFirst({ where: { ownerId: adminUser.id } });
  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: adminUser.id,
        name: "Bayaro Coffee Demo",
        storeCode: "BAYARO01",
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
  } else {
    // Ensure storeCode is set
    await prisma.business.update({ where: { id: business.id }, data: { storeCode: "BAYARO01" } });
  }
  console.log(`✓ Business "${business.name}" seeded (Kode Toko: BAYARO01)`);

  // Subscription
  if (proPlan) {
    await prisma.subscription.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        planId: proPlan.id,
        status: "trial",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("✓ Subscription Pro seeded");
  }

  // ═══════════════════════════════════════════════
  // OUTLETS (3 outlets)
  // ═══════════════════════════════════════════════
  const outlet1Id = `outlet-demo-1-${business.id}`.slice(0, 25);
  const outlet2Id = `outlet-demo-2-${business.id}`.slice(0, 25);
  const outlet3Id = `outlet-demo-3-${business.id}`.slice(0, 25);

  const outlet1 = await prisma.outlet.upsert({
    where: { id: outlet1Id },
    update: {},
    create: { id: outlet1Id, businessId: business.id, name: "Bayaro Sudirman (Pusat)", address: "Jl. Sudirman No. 1, Lantai 1", city: "Jakarta Selatan", phone: "021-1234567", openTime: "07:00", closeTime: "22:00", isActive: true },
  });
  const outlet2 = await prisma.outlet.upsert({
    where: { id: outlet2Id },
    update: {},
    create: { id: outlet2Id, businessId: business.id, name: "Bayaro Thamrin", address: "Jl. Thamrin No. 5, Gedung A", city: "Jakarta Pusat", phone: "021-7654321", openTime: "08:00", closeTime: "21:00", isActive: true },
  });
  const outlet3 = await prisma.outlet.upsert({
    where: { id: outlet3Id },
    update: {},
    create: { id: outlet3Id, businessId: business.id, name: "Bayaro BSD", address: "Ruko Golden Boulevard Blok C No. 12", city: "Tangerang Selatan", phone: "021-8881234", openTime: "08:00", closeTime: "22:00", isActive: true },
  });
  console.log("✓ 3 Outlets seeded");

  // ═══════════════════════════════════════════════
  // ROLES
  // ═══════════════════════════════════════════════
  const allPermissions = [
    "dashboard.view", "products.view", "products.manage",
    "inventory.view", "inventory.manage", "employees.view", "employees.manage",
    "reports.view", "settings.manage", "pos.access", "pos.void", "pos.close_shift",
    "promos.view", "promos.manage", "customers.view", "customers.manage",
  ];

  const ownerRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Owner" } },
    update: {},
    create: { businessId: business.id, name: "Owner", description: "Akses penuh ke semua fitur", permissions: allPermissions, isSystem: true },
  });
  const managerRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Manager" } },
    update: {},
    create: {
      businessId: business.id, name: "Manager", description: "Kelola operasional dan laporan",
      permissions: ["dashboard.view", "products.view", "products.manage", "inventory.view", "inventory.manage", "employees.view", "reports.view", "pos.access", "pos.void", "promos.view", "promos.manage", "customers.view"],
      isSystem: true,
    },
  });
  const kasirRole = await prisma.role.upsert({
    where: { businessId_name: { businessId: business.id, name: "Kasir" } },
    update: {},
    create: { businessId: business.id, name: "Kasir", description: "Akses POS dan transaksi", permissions: ["pos.access", "products.view", "inventory.view"], isSystem: true },
  });
  console.log("✓ Roles seeded");

  // ═══════════════════════════════════════════════
  // EMPLOYEES
  // ═══════════════════════════════════════════════
  const adminEmpId = `emp-admin-${business.id}`.slice(0, 25);
  const mgrEmpId = `emp-mgr-${business.id}`.slice(0, 25);
  const kasirEmpId = `emp-kasir-${business.id}`.slice(0, 25);

  const adminEmployee = await prisma.employee.upsert({
    where: { id: adminEmpId },
    update: {},
    create: { id: adminEmpId, businessId: business.id, userId: adminUser.id, roleId: ownerRole.id, name: "Demo Admin", email: "admin@bayaro.id", pin: await bcrypt.hash("1234", 10), isActive: true },
  });
  const managerEmployee = await prisma.employee.upsert({
    where: { id: mgrEmpId },
    update: {},
    create: { id: mgrEmpId, businessId: business.id, userId: managerUser.id, roleId: managerRole.id, name: "Demo Manager", email: "manager@bayaro.id", pin: await bcrypt.hash("2222", 10), isActive: true },
  });
  const kasirEmployee = await prisma.employee.upsert({
    where: { id: kasirEmpId },
    update: {},
    create: { id: kasirEmpId, businessId: business.id, userId: kasirUser.id, roleId: kasirRole.id, name: "Demo Kasir", email: "kasir@bayaro.id", pin: await bcrypt.hash("3333", 10), isActive: true },
  });
  console.log("✓ Employees seeded");

  // Employee-Outlet assignments
  // Admin: semua outlet
  for (const outletId of [outlet1.id, outlet2.id, outlet3.id]) {
    await prisma.employeeOutlet.upsert({
      where: { employeeId_outletId: { employeeId: adminEmployee.id, outletId } },
      update: {},
      create: { employeeId: adminEmployee.id, outletId },
    });
  }
  // Manager: outlet 1 & 2
  for (const outletId of [outlet1.id, outlet2.id]) {
    await prisma.employeeOutlet.upsert({
      where: { employeeId_outletId: { employeeId: managerEmployee.id, outletId } },
      update: {},
      create: { employeeId: managerEmployee.id, outletId },
    });
  }
  // Kasir: hanya outlet 1
  await prisma.employeeOutlet.upsert({
    where: { employeeId_outletId: { employeeId: kasirEmployee.id, outletId: outlet1.id } },
    update: {},
    create: { employeeId: kasirEmployee.id, outletId: outlet1.id },
  });
  console.log("✓ Employee-Outlet assignments seeded (Admin=3, Manager=2, Kasir=1)");

  // ═══════════════════════════════════════════════
  // BUSINESS SETTINGS
  // ═══════════════════════════════════════════════
  await prisma.businessSettings.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      receiptHeader1: "Bayaro Coffee Demo",
      receiptHeader2: "Jl. Sudirman No. 1, Jakarta",
      receiptHeader3: "021-1234567",
      receiptThankYou: "Terima kasih telah berkunjung!",
      receiptShowLogo: true,
      receiptShowAddress: true,
      receiptShowPhone: true,
      receiptShowKasir: true,
    },
  });
  console.log("✓ Business settings seeded");

  // ═══════════════════════════════════════════════
  // PAYMENT METHODS
  // ═══════════════════════════════════════════════
  const paymentMethods = [
    { name: "Tunai", type: "CASH" as const, isEnabled: true },
    { name: "QRIS", type: "QRIS_STATIC" as const, isEnabled: true },
    { name: "Transfer Bank", type: "BANK_TRANSFER" as const, isEnabled: true, bankName: "BCA", accountNumber: "1234567890", accountName: "PT Bayaro Coffee" },
  ];
  for (const pm of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({ where: { businessId: business.id, name: pm.name } });
    if (!existing) {
      await prisma.paymentMethod.create({ data: { businessId: business.id, ...pm } });
    }
  }
  console.log("✓ Payment methods seeded");

  // ═══════════════════════════════════════════════
  // CATEGORIES & PRODUCTS
  // ═══════════════════════════════════════════════
  const categories = [
    { name: "Kopi", icon: "☕" },
    { name: "Non-Kopi", icon: "🥤" },
    { name: "Makanan", icon: "🍽️" },
    { name: "Snack", icon: "🍪" },
  ];
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { businessId: business.id, name: cat.name } });
    const c = existing ?? await prisma.category.create({ data: { businessId: business.id, ...cat } });
    createdCategories[cat.name] = c.id;
  }
  console.log("✓ Categories seeded");

  const productsData = [
    { name: "Espresso", basePrice: 25000, categoryKey: "Kopi", trackStock: true },
    { name: "Americano", basePrice: 28000, categoryKey: "Kopi", trackStock: true },
    { name: "Cappuccino", basePrice: 35000, categoryKey: "Kopi", trackStock: true },
    { name: "Latte", basePrice: 38000, categoryKey: "Kopi", trackStock: true },
    { name: "Matcha Latte", basePrice: 40000, categoryKey: "Non-Kopi", trackStock: true },
    { name: "Chocolate", basePrice: 35000, categoryKey: "Non-Kopi", trackStock: true },
    { name: "Es Teh", basePrice: 15000, categoryKey: "Non-Kopi", trackStock: true },
    { name: "Lemon Tea", basePrice: 18000, categoryKey: "Non-Kopi", trackStock: true },
    { name: "Croissant", basePrice: 30000, categoryKey: "Makanan", trackStock: true },
    { name: "Sandwich Tuna", basePrice: 45000, categoryKey: "Makanan", trackStock: true },
    { name: "Nasi Goreng", basePrice: 35000, categoryKey: "Makanan", trackStock: true },
    { name: "Pasta Carbonara", basePrice: 48000, categoryKey: "Makanan", trackStock: true },
    { name: "Cheesecake", basePrice: 40000, categoryKey: "Snack", trackStock: true },
    { name: "Cookies", basePrice: 20000, categoryKey: "Snack", trackStock: true },
    { name: "Brownies", basePrice: 28000, categoryKey: "Snack", trackStock: true },
  ];

  const createdProducts: Array<{ id: string; name: string; basePrice: number }> = [];
  for (const p of productsData) {
    let product = await prisma.product.findFirst({ where: { businessId: business.id, name: p.name } });
    if (!product) {
      product = await prisma.product.create({
        data: { businessId: business.id, name: p.name, basePrice: p.basePrice, categoryId: createdCategories[p.categoryKey], isActive: true, trackStock: p.trackStock },
      });
      for (const outletId of [outlet1.id, outlet2.id, outlet3.id]) {
        await prisma.stock.create({ data: { productId: product.id, outletId, quantity: Math.floor(Math.random() * 50) + 20, minStock: 5 } });
      }
    }
    createdProducts.push({ id: product.id, name: product.name, basePrice: product.basePrice });
  }
  console.log("✓ Products + stock seeded");

  // ═══════════════════════════════════════════════
  // PRODUCT VARIANTS (for coffee products)
  // ═══════════════════════════════════════════════
  const coffeeProducts = createdProducts.filter((p) =>
    ["Espresso", "Americano", "Cappuccino", "Latte", "Matcha Latte", "Chocolate"].includes(p.name)
  );
  for (const product of coffeeProducts) {
    const existingVariants = await prisma.productVariant.findFirst({ where: { productId: product.id } });
    if (!existingVariants) {
      await prisma.productVariant.createMany({
        data: [
          { productId: product.id, name: "Hot", priceAdjustment: 0, sortOrder: 1 },
          { productId: product.id, name: "Iced", priceAdjustment: 5000, sortOrder: 2 },
        ],
      });
    }
  }
  console.log("✓ Product variants seeded");

  // ═══════════════════════════════════════════════
  // PRODUCT TOPPINGS (for beverages)
  // ═══════════════════════════════════════════════
  const beverageProducts = createdProducts.filter((p) =>
    ["Latte", "Cappuccino", "Matcha Latte", "Chocolate", "Es Teh", "Lemon Tea"].includes(p.name)
  );
  for (const product of beverageProducts) {
    const existingToppings = await prisma.productTopping.findFirst({ where: { productId: product.id } });
    if (!existingToppings) {
      await prisma.productTopping.createMany({
        data: [
          { productId: product.id, name: "Extra Shot", price: 8000 },
          { productId: product.id, name: "Oat Milk", price: 10000 },
          { productId: product.id, name: "Whipped Cream", price: 5000 },
        ],
      });
    }
  }
  console.log("✓ Product toppings seeded");

  // ═══════════════════════════════════════════════
  // TABLES
  // ═══════════════════════════════════════════════
  const tableNames = ["Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5", "Meja 6", "Meja 7", "Meja 8", "Bar 1", "Bar 2"];
  for (const tableName of tableNames) {
    const existing = await prisma.table.findFirst({ where: { businessId: business.id, name: tableName } });
    if (!existing) {
      await prisma.table.create({
        data: { businessId: business.id, outletId: outlet1.id, name: tableName, capacity: tableName.startsWith("Bar") ? 2 : 4, isActive: true },
      });
    }
  }
  console.log("✓ Tables seeded");

  // ═══════════════════════════════════════════════
  // SHIFTS (time definitions)
  // ═══════════════════════════════════════════════
  const shifts = [
    { name: "Shift Pagi", startTime: "07:00", endTime: "14:00" },
    { name: "Shift Siang", startTime: "14:00", endTime: "21:00" },
    { name: "Shift Malam", startTime: "21:00", endTime: "02:00" },
  ];
  for (const shift of shifts) {
    const existing = await prisma.shift.findFirst({ where: { businessId: business.id, name: shift.name } });
    if (!existing) {
      await prisma.shift.create({ data: { businessId: business.id, ...shift } });
    }
  }
  console.log("✓ Shifts seeded");

  // ═══════════════════════════════════════════════
  // CUSTOMERS
  // ═══════════════════════════════════════════════
  const customersData = [
    { name: "Budi Santoso", phone: "081234567001", email: "budi@email.com", address: "Jl. Merdeka No. 10, Jakarta" },
    { name: "Siti Rahayu", phone: "081234567002", email: "siti@email.com", address: "Jl. Gatot Subroto No. 5" },
    { name: "Ahmad Hidayat", phone: "081234567003", email: "ahmad@email.com", address: "Jl. Thamrin No. 15" },
    { name: "Dewi Kusuma", phone: "081234567004", email: "dewi@email.com", address: "Jl. Kemang Raya No. 20" },
    { name: "Riko Pratama", phone: "081234567005", email: "riko@email.com", address: "Jl. BSD No. 8" },
    { name: "Maya Putri", phone: "081234567006", email: null, address: "Jl. Kelapa Gading" },
    { name: "Joko Widodo", phone: "081234567007", email: "joko@email.com", address: null },
    { name: "Rina Amelia", phone: "081234567008", email: "rina@email.com", address: "Jl. Pondok Indah" },
    { name: "Hendra Gunawan", phone: "081234567009", email: null, address: null },
    { name: "Lisa Permata", phone: "081234567010", email: "lisa@email.com", address: "Jl. Senopati No. 3" },
  ];
  const createdCustomers: Array<{ id: string; name: string }> = [];
  for (const c of customersData) {
    const existing = await prisma.customer.findFirst({ where: { businessId: business.id, phone: c.phone } });
    if (!existing) {
      const customer = await prisma.customer.create({
        data: { businessId: business.id, ...c, totalVisits: Math.floor(Math.random() * 20) + 1, totalSpent: Math.floor(Math.random() * 500000) + 50000 },
      });
      createdCustomers.push({ id: customer.id, name: customer.name });
    } else {
      createdCustomers.push({ id: existing.id, name: existing.name });
    }
  }
  console.log("✓ Customers seeded");

  // ═══════════════════════════════════════════════
  // PROMOS
  // ═══════════════════════════════════════════════
  const promosData = [
    { name: "Diskon 10% Member", type: "VOUCHER" as const, discountType: "PERCENTAGE" as const, discountValue: 10, code: "MEMBER10", minOrderAmount: 50000, isActive: true },
    { name: "Potongan 15rb", type: "VOUCHER" as const, discountType: "NOMINAL" as const, discountValue: 15000, code: "HEMAT15", minOrderAmount: 75000, maxDiscount: 15000, isActive: true },
    { name: "Happy Hour 20%", type: "HAPPY_HOUR" as const, discountType: "PERCENTAGE" as const, discountValue: 20, startHour: 14, endHour: 16, maxDiscount: 30000, isActive: true },
    { name: "Weekend Special 5%", type: "VOUCHER" as const, discountType: "PERCENTAGE" as const, discountValue: 5, code: "WEEKEND5", isActive: true },
    { name: "Promo Grand Opening", type: "VOUCHER" as const, discountType: "NOMINAL" as const, discountValue: 25000, code: "GRAND25", minOrderAmount: 100000, usageLimit: 100, isActive: false },
  ];
  for (const promo of promosData) {
    const existing = await prisma.promo.findFirst({ where: { businessId: business.id, name: promo.name } });
    if (!existing) {
      await prisma.promo.create({
        data: {
          businessId: business.id,
          ...promo,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log("✓ Promos seeded");

  // ═══════════════════════════════════════════════
  // CASHIER SESSIONS (closed — for history)
  // ═══════════════════════════════════════════════
  const existingSessions = await prisma.cashierSession.count({ where: { businessId: business.id } });
  if (existingSessions === 0) {
    const sessionDates = [
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    ];

    for (let i = 0; i < sessionDates.length; i++) {
      const openedAt = new Date(sessionDates[i]);
      openedAt.setHours(8, 0, 0, 0);
      const closedAt = new Date(sessionDates[i]);
      closedAt.setHours(16, 0, 0, 0);

      const initialCash = 200000;
      const cashSales = Math.floor(Math.random() * 800000) + 300000;
      const expectedCash = initialCash + cashSales;
      const closingCash = expectedCash + (Math.random() > 0.7 ? Math.floor(Math.random() * 10000) - 5000 : 0);

      await prisma.cashierSession.create({
        data: {
          businessId: business.id,
          outletId: outlet1.id,
          employeeId: kasirEmployee.id,
          openedAt,
          closedAt,
          initialCash,
          closingCash,
          expectedCash,
          difference: closingCash - expectedCash,
          isOpen: false,
        },
      });
    }
    console.log("✓ Cashier sessions (history) seeded");
  }

  // ═══════════════════════════════════════════════
  // ORDERS & PAYMENTS (demo transactions)
  // ═══════════════════════════════════════════════
  const existingOrders = await prisma.order.count({ where: { businessId: business.id } });
  if (existingOrders === 0) {
    const tables = await prisma.table.findMany({ where: { businessId: business.id } });
    const sessions = await prisma.cashierSession.findMany({ where: { businessId: business.id }, orderBy: { openedAt: "asc" } });

    let orderSeq = 1;

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const day = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      const ordersPerDay = Math.floor(Math.random() * 8) + 5; // 5-12 orders per day
      const session = sessions.find((s) => {
        const sDate = new Date(s.openedAt);
        return sDate.toDateString() === day.toDateString();
      });

      for (let j = 0; j < ordersPerDay; j++) {
        const hour = 8 + Math.floor(Math.random() * 10); // 8am to 6pm
        const minute = Math.floor(Math.random() * 60);
        const orderTime = new Date(day);
        orderTime.setHours(hour, minute, 0, 0);

        const isTableOrder = Math.random() > 0.3;
        const table = isTableOrder ? tables[Math.floor(Math.random() * tables.length)] : null;
        const customer = Math.random() > 0.5 ? createdCustomers[Math.floor(Math.random() * createdCustomers.length)] : null;

        // Pick 1-4 random products
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts: Array<{ id: string; name: string; basePrice: number; qty: number }> = [];
        for (let k = 0; k < numItems; k++) {
          const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const existing = selectedProducts.find((sp) => sp.id === prod.id);
          if (existing) {
            existing.qty += 1;
          } else {
            selectedProducts.push({ ...prod, qty: Math.floor(Math.random() * 2) + 1 });
          }
        }

        const subtotal = selectedProducts.reduce((sum, p) => sum + p.basePrice * p.qty, 0);
        const taxAmount = Math.round(subtotal * (business.taxRate / 100));
        const serviceAmount = Math.round(subtotal * (business.serviceRate / 100));
        const totalAmount = subtotal + taxAmount + serviceAmount;
        const orderNumber = `TRX-${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, "0")}${String(day.getDate()).padStart(2, "0")}-${String(orderSeq++).padStart(4, "0")}`;

        const paymentMethod = Math.random() > 0.6 ? "CASH" : "QRIS";
        const cashEntered = paymentMethod === "CASH" ? Math.ceil(totalAmount / 10000) * 10000 : null;
        const changeAmount = cashEntered ? cashEntered - totalAmount : null;

        const order = await prisma.order.create({
          data: {
            businessId: business.id,
            outletId: outlet1.id,
            tableId: table?.id,
            employeeId: kasirEmployee.id,
            cashierSessionId: session?.id,
            customerId: customer?.id,
            orderNumber,
            status: "PAID",
            orderType: table ? "DINE_IN" : "TAKEAWAY",
            subtotal,
            taxAmount,
            serviceAmount,
            discountAmount: 0,
            totalAmount,
            paidAt: orderTime,
            createdAt: orderTime,
            items: {
              create: selectedProducts.map((p) => ({
                productId: p.id,
                name: p.name,
                price: p.basePrice,
                quantity: p.qty,
                subtotal: p.basePrice * p.qty,
              })),
            },
          },
        });

        // Create payment
        await prisma.payment.create({
          data: {
            orderId: order.id,
            businessId: business.id,
            outletId: outlet1.id,
            employeeId: kasirEmployee.id,
            method: paymentMethod,
            totalAmount,
            cashEntered,
            changeAmount,
            status: "PAID",
            paidAt: orderTime,
            createdAt: orderTime,
          },
        });
      }
    }
    console.log("✓ Orders & payments seeded (7 days of transactions)");
  }

  // ═══════════════════════════════════════════════
  // STOCK MOVEMENTS
  // ═══════════════════════════════════════════════
  const existingMovements = await prisma.stockMovement.count();
  if (existingMovements === 0) {
    const stocks = await prisma.stock.findMany({ where: { outletId: outlet1.id }, take: 8 });
    for (const stock of stocks) {
      // Initial stock in
      await prisma.stockMovement.create({
        data: { stockId: stock.id, type: "IN", quantity: stock.quantity, note: "Stok awal", createdBy: adminEmployee.id, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });
      // A random adjustment
      if (Math.random() > 0.5) {
        const adj = Math.floor(Math.random() * 10) - 5;
        await prisma.stockMovement.create({
          data: { stockId: stock.id, type: "ADJUSTMENT", quantity: adj, note: "Penyesuaian stok opname", createdBy: managerEmployee.id, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        });
      }
    }
    console.log("✓ Stock movements seeded");
  }

  // ═══════════════════════════════════════════════
  // STOCK TRANSFERS
  // ═══════════════════════════════════════════════
  const existingTransfers = await prisma.stockTransfer.count();
  if (existingTransfers === 0) {
    const transferProducts = createdProducts.slice(0, 3);

    // Transfer 1: completed
    await prisma.stockTransfer.create({
      data: {
        businessId: business.id,
        fromOutletId: outlet1.id,
        toOutletId: outlet2.id,
        status: "completed",
        note: "Restok outlet cabang",
        createdBy: managerEmployee.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        items: {
          create: transferProducts.map((p) => ({ productId: p.id, quantity: 10 })),
        },
      },
    });

    // Transfer 2: pending (outlet2 -> outlet3)
    await prisma.stockTransfer.create({
      data: {
        businessId: business.id,
        fromOutletId: outlet2.id,
        toOutletId: outlet3.id,
        status: "pending",
        note: "Restok outlet BSD",
        createdBy: managerEmployee.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        items: {
          create: [{ productId: createdProducts[4].id, quantity: 5 }],
        },
      },
    });
    console.log("✓ Stock transfers seeded");
  }

  // ═══════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════
  console.log(`
═══════════════════════════════════════════
  DEMO DATA SEEDED SUCCESSFULLY
═══════════════════════════════════════════

  KODE TOKO: BAYARO01

  DEMO ACCOUNTS
  ─────────────
  Admin   : admin@bayaro.id   / demo123 (PIN: 1234)
  Manager : manager@bayaro.id / demo123 (PIN: 2222)
  Kasir   : kasir@bayaro.id   / demo123 (PIN: 3333)

  OUTLETS (3)
  ─────────────
  • Bayaro Sudirman (Pusat) — Jakarta Selatan
  • Bayaro Thamrin — Jakarta Pusat
  • Bayaro BSD — Tangerang Selatan

  AKSES PER ROLE
  ─────────────
  Admin   : Semua outlet, semua fitur
  Manager : 2 outlet (Sudirman + Thamrin), tanpa settings
  Kasir   : 1 outlet (Sudirman), hanya POS + lihat produk/stok

  DATA DEMO
  ─────────────
  • 15 produk (dengan variant & topping)
  • 10 pelanggan
  • 5 promo aktif
  • 7 hari transaksi (~50-80 order)
  • 6 sesi kasir (history)
  • Stock movements & transfers
  • 10 meja + 3 shift

═══════════════════════════════════════════
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
