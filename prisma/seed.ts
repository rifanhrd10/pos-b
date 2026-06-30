import bcrypt from "bcryptjs";
import { PrismaClient, PaymentMethodType, OutletAddonStatus, ReceiptPaperSize, ShiftStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const roleNames = ["Owner", "Admin", "Kasir"] as const;
  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `Role ${name} Bayaro POS` },
      }),
    ),
  );

  const outlet = await prisma.outlet.upsert({
    where: { id: "5f182e12-f6d2-49de-a1f7-989ca7bcb7f5" },
    update: {},
    create: {
      id: "5f182e12-f6d2-49de-a1f7-989ca7bcb7f5",
      name: "Bayaro Kemang",
      address: "Jl. Kemang Raya No. 88, Jakarta Selatan",
      phone: "021-555-7788",
      email: "kemang@bayaro.id",
      taxRate: 11,
      serviceChargeRate: 5,
      receiptFooter: "Terima kasih sudah berbelanja di Bayaro POS",
    },
  });

  const roleMap = Object.fromEntries(roles.map((role) => [role.name, role.id]));

  const permissionCatalog = [
    ["dashboard", "view", "Lihat dashboard utama"],
    ["kasir", "use", "Gunakan modul kasir"],
    ["transaksi", "view", "Lihat daftar transaksi"],
    ["transaksi", "manage", "Refund atau batalkan transaksi"],
    ["kategori", "manage", "Kelola kategori produk"],
    ["produk", "manage", "Kelola produk"],
    ["topping", "manage", "Kelola topping dan modifier"],
    ["stok", "manage", "Kelola stok dan penyesuaian"],
    ["supplier", "manage", "Kelola supplier"],
    ["pelanggan", "manage", "Kelola pelanggan"],
    ["karyawan-shift", "manage", "Kelola user, role, dan shift"],
    ["role-permission", "manage", "Kelola hak akses role"],
    ["pembayaran", "manage", "Kelola metode pembayaran"],
    ["laporan", "view", "Lihat laporan"],
    ["laporan", "export", "Export laporan"],
    ["outlet", "manage", "Kelola profil outlet"],
    ["struk", "manage", "Kelola template struk"],
    ["pengaturan", "manage", "Kelola pengaturan sistem"],
    ["modul-tambahan", "view", "Lihat modul tambahan Bayaro"],
  ] as const;

  const permissions = await Promise.all(
    permissionCatalog.map(([module, action, description]) =>
      prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: { description },
        create: { module, action, description },
      }),
    ),
  );

  const permissionMap = new Map(permissions.map((permission) => [`${permission.module}:${permission.action}`, permission.id]));

  const rolePermissionMatrix: Record<(typeof roleNames)[number], string[]> = {
    Owner: permissionCatalog.map(([module, action]) => `${module}:${action}`),
    Admin: permissionCatalog.map(([module, action]) => `${module}:${action}`),
    Kasir: [
      "dashboard:view",
      "kasir:use",
      "transaksi:view",
      "pelanggan:manage",
      "laporan:view",
    ],
  };

  for (const [roleName, keys] of Object.entries(rolePermissionMatrix) as Array<[keyof typeof rolePermissionMatrix, string[]]>) {
    const roleId = roleMap[roleName];
    for (const key of keys) {
      const permissionId = permissionMap.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  const users = [
    { name: "Owner Bayaro", email: "owner@bayaro.id", roleId: roleMap.Owner },
    { name: "Admin Bayaro", email: "admin@bayaro.id", roleId: roleMap.Admin },
    { name: "Kasir Sari", email: "kasir@bayaro.id", roleId: roleMap.Kasir },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash, outletId: outlet.id },
      create: {
        ...user,
        passwordHash,
        outletId: outlet.id,
        phone: "08123456789",
      },
    });
  }

  const categories = [
    ["Minuman", "minuman"],
    ["Makanan", "makanan"],
    ["Snack", "snack"],
    ["Paket Hemat", "paket-hemat"],
  ] as const;

  for (const [index, [name, slug]] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        sortOrder: index + 1,
        description: `Kategori ${name}`,
      },
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.name, category.id]),
  );

  const productPlaceholder = "/images/products/product-placeholder.svg";
  const products = [
    ["Kopi Susu Aren", "BAY-KSA-001", "Minuman", 28000, 14000],
    ["Es Teh Manis", "BAY-ETM-001", "Minuman", 12000, 4000],
    ["Nasi Goreng Spesial", "BAY-NGS-001", "Makanan", 32000, 18000],
    ["Roti Bakar Coklat", "BAY-RBC-001", "Snack", 18000, 8500],
    ["Ayam Geprek", "BAY-AGP-001", "Makanan", 29000, 16000],
    ["Mie Ayam", "BAY-MAY-001", "Makanan", 24000, 12000],
    ["Paket Hemat 1", "BAY-PH1-001", "Paket Hemat", 42000, 24000],
  ] as const;

  for (const [name, sku, categoryName, sellPrice, costPrice] of products) {
    await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        outletId: outlet.id,
        categoryId: categoryMap[categoryName],
        name,
        sku,
        description: `${name} siap jual untuk starter menu.`,
        imageUrl: productPlaceholder,
        sellPrice,
        costPrice,
        stock: 50,
        minStock: 5,
      },
    });
  }

  const groups = [
    ["Topping Minuman", 0, 3, false],
    ["Level Pedas", 1, 1, true],
    ["Tambahan Lauk", 0, 3, false],
    ["Pilihan Gula", 0, 1, false],
  ] as const;

  for (const [name, minSelect, maxSelect, isRequired] of groups) {
    const existing = await prisma.modifierGroup.findFirst({ where: { name } });
    if (!existing) {
      await prisma.modifierGroup.create({
        data: { name, minSelect, maxSelect, isRequired, description: name },
      });
    }
  }

  const modifierGroups = await prisma.modifierGroup.findMany();
  const groupMap = Object.fromEntries(modifierGroups.map((group) => [group.name, group.id]));

  const modifiers = [
    ["Topping Minuman", "Boba", 5000],
    ["Topping Minuman", "Extra Shot", 7000],
    ["Topping Minuman", "Whipped Cream", 6000],
    ["Level Pedas", "Level 1", 0],
    ["Level Pedas", "Level 2", 0],
    ["Level Pedas", "Level 3", 2000],
    ["Tambahan Lauk", "Telur", 5000],
    ["Tambahan Lauk", "Keju", 4000],
    ["Tambahan Lauk", "Nasi Tambah", 6000],
    ["Pilihan Gula", "Normal", 0],
    ["Pilihan Gula", "Less Sugar", 0],
    ["Pilihan Gula", "No Sugar", 0],
  ] as const;

  for (const [groupName, name, price] of modifiers) {
    const existing = await prisma.modifier.findFirst({
      where: { modifierGroupId: groupMap[groupName], name },
    });
    if (!existing) {
      await prisma.modifier.create({
        data: {
          modifierGroupId: groupMap[groupName],
          name,
          price,
          isStockTracked: false,
        },
      });
    }
  }

  const productMap = Object.fromEntries((await prisma.product.findMany()).map((product) => [product.name, product.id]));
  const productLinks = [
    ["Kopi Susu Aren", "Topping Minuman"],
    ["Kopi Susu Aren", "Pilihan Gula"],
    ["Es Teh Manis", "Pilihan Gula"],
    ["Ayam Geprek", "Level Pedas"],
    ["Ayam Geprek", "Tambahan Lauk"],
    ["Nasi Goreng Spesial", "Tambahan Lauk"],
  ] as const;

  for (const [productName, groupName] of productLinks) {
    await prisma.productModifierGroup.upsert({
      where: {
        productId_modifierGroupId: {
          productId: productMap[productName],
          modifierGroupId: groupMap[groupName],
        },
      },
      update: {},
      create: {
        productId: productMap[productName],
        modifierGroupId: groupMap[groupName],
      },
    });
  }

  const payments = [
    ["Tunai", PaymentMethodType.CASH, false, null],
    ["QRIS", PaymentMethodType.QRIS, false, null],
    ["Transfer Bank", PaymentMethodType.BANK_TRANSFER, false, null],
    ["GoPay", PaymentMethodType.EWALLET, true, "e-wallet-payment"],
    ["OVO", PaymentMethodType.EWALLET, true, "e-wallet-payment"],
    ["DANA", PaymentMethodType.EWALLET, true, "e-wallet-payment"],
    ["Debit", PaymentMethodType.CARD, true, "debit-kredit"],
    ["Kredit", PaymentMethodType.CARD, true, "debit-kredit"],
  ] as const;

  for (const [name, type, isAddon, addonSlug] of payments) {
    const existing = await prisma.paymentMethod.findFirst({ where: { name } });
    if (!existing) {
      await prisma.paymentMethod.create({
        data: { name, type, isAddon, addonSlug, isActive: true },
      });
    } else if (!existing.isActive) {
      await prisma.paymentMethod.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    }
  }

  const addonData = [
    ["Promo Basic", "promo-basic", "Buat promo ringan untuk produk favorit.", 49000],
    ["Voucher Basic", "voucher-basic", "Voucher nominal atau persentase sederhana.", 49000],
    ["QR Menu", "qr-menu", "Tampilkan menu digital via QR untuk pelanggan.", 79000],
    ["Meja Sederhana", "meja-sederhana", "Kelola nomor meja dan status ketersediaan.", 39000],
    ["Supplier", "supplier", "Simpan data supplier starter.", 59000],
    ["Stock Opname", "stock-opname", "Catat opname stok dengan histori.", 69000],
    ["Export Laporan", "export-laporan", "Export laporan ke Excel atau PDF.", 59000],
    ["Role Permission", "role-permission", "Atur hak akses detail per modul.", 59000],
    ["E-wallet Payment", "e-wallet-payment", "Aktifkan metode e-wallet.", 49000],
    ["Debit/Kredit", "debit-kredit", "Aktifkan pembayaran kartu.", 49000],
    ["Split Payment", "split-payment", "Bayar satu transaksi dengan multi metode.", 69000],
    ["Barcode Produk", "barcode-produk", "Aktifkan barcode scanner produk.", 39000],
    ["Reservasi Basic", "reservasi-basic", "Jadwalkan reservasi pelanggan sederhana.", 59000],
    ["Backup Data", "backup-data", "Backup data berkala manual.", 79000],
  ] as const;

  for (const [name, slug, description, price] of addonData) {
    const addon = await prisma.addon.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description, price },
    });

    await prisma.outletAddon.upsert({
      where: { outletId_addonId: { outletId: outlet.id, addonId: addon.id } },
      update: {
        status: OutletAddonStatus.ACTIVE,
        activatedAt: new Date(),
        expiredAt: null,
      },
      create: {
        outletId: outlet.id,
        addonId: addon.id,
        status: OutletAddonStatus.ACTIVE,
        activatedAt: new Date(),
      },
    });
  }

  await prisma.receiptSetting.upsert({
    where: { outletId: outlet.id },
    update: {},
    create: {
      outletId: outlet.id,
      showLogo: true,
      logoUrl: "/branding/bayaro-app-icon-blue.png",
      headerText: "Bayaro POS",
      footerText: "Transaksi cepat untuk bisnis yang sedang tumbuh.",
      showCashierName: true,
      showCustomerName: true,
      showTax: true,
      showServiceCharge: true,
      paperSize: ReceiptPaperSize.MM_80,
    },
  });

  const cashier = await prisma.user.findUniqueOrThrow({ where: { email: "kasir@bayaro.id" } });
  const openShift = await prisma.shift.findFirst({
    where: { outletId: outlet.id, userId: cashier.id, status: ShiftStatus.OPEN },
  });

  if (!openShift) {
    await prisma.shift.create({
      data: {
        outletId: outlet.id,
        userId: cashier.id,
        openedAt: new Date(),
        openingCash: 300000,
        status: ShiftStatus.OPEN,
        note: "Shift awal seed data",
      },
    });
  }

  const suppliers = [
    ["Supplier Kopi Nusantara", "Rudi Hartono", "081300000001", "kopi@nusantara.id", "Jakarta Selatan", "Biji kopi dan syrup"],
    ["Fresh Mart Distribusi", "Nina Putri", "081300000002", "sales@freshmart.id", "Depok", "Bahan retail dan snack"],
    ["Prima Kemasan", "Bagus Saputra", "081300000003", "halo@primakemasan.id", "Tangerang", "Cup, tutup, sedotan, dan kemasan"],
  ] as const;

  for (const [name, contactPerson, phone, email, address, note] of suppliers) {
    const existing = await prisma.supplier.findFirst({
      where: { outletId: outlet.id, name, deletedAt: null },
    });

    if (!existing) {
      await prisma.supplier.create({
        data: {
          outletId: outlet.id,
          name,
          contactPerson,
          phone,
          email,
          address,
          note,
          isActive: true,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
