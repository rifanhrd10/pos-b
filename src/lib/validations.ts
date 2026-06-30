import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter."),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0, "Urutan tidak boleh negatif."),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nama produk minimal 2 karakter."),
  sku: z.string().min(3, "SKU minimal 3 karakter."),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.string().uuid("Kategori wajib dipilih."),
  sellPrice: z.coerce.number().positive("Harga jual wajib lebih dari 0."),
  costPrice: z.coerce.number().min(0, "Harga modal tidak boleh negatif."),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif."),
  minStock: z.coerce.number().int().min(0, "Minimum stok tidak boleh negatif."),
  isStockTracked: z.boolean().default(true),
  isActive: z.boolean().default(true),
  modifierGroupIds: z.array(z.string().uuid()).default([]),
});

export const checkoutSchema = z.object({
  outletId: z.string().uuid(),
  cashierId: z.string().uuid(),
  customerId: z.string().uuid().optional().nullable(),
  shiftId: z.string().uuid().optional().nullable(),
  discountTotal: z.coerce.number().min(0).default(0),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.coerce.number().int().min(1),
      note: z.string().optional().nullable(),
      modifiers: z
        .array(
          z.object({
            modifierId: z.string().uuid(),
            quantity: z.coerce.number().int().min(1).default(1),
          }),
        )
        .default([]),
    }),
  ).min(1, "Keranjang tidak boleh kosong."),
  payments: z.array(
    z.object({
      paymentMethodId: z.string().uuid(),
      amount: z.coerce.number().positive(),
      referenceNumber: z.string().optional().nullable(),
    }),
  ).min(1, "Pilih minimal satu metode pembayaran."),
});

export const outletSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  taxRate: z.coerce.number().min(0),
  serviceChargeRate: z.coerce.number().min(0),
  receiptFooter: z.string().optional().nullable(),
});

export const receiptSchema = z.object({
  headerText: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  showLogo: z.boolean().default(true),
  showCashierName: z.boolean().default(true),
  showCustomerName: z.boolean().default(true),
  showTax: z.boolean().default(true),
  showServiceCharge: z.boolean().default(true),
  paperSize: z.enum(["MM_58", "MM_80"]),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Nama pelanggan minimal 2 karakter."),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email tidak valid.").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, "Nama supplier minimal 2 karakter."),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email tidak valid.").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const userSchema = z.object({
  name: z.string().min(2, "Nama karyawan minimal 2 karakter."),
  email: z.string().email("Email tidak valid."),
  phone: z.string().optional().nullable(),
  roleId: z.string().uuid("Role wajib dipilih."),
  outletId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const shiftOpenSchema = z.object({
  userId: z.string().uuid(),
  outletId: z.string().uuid(),
  openingCash: z.coerce.number().min(0, "Modal awal tidak boleh negatif."),
  note: z.string().optional().nullable(),
});

export const shiftCloseSchema = z.object({
  closingCash: z.coerce.number().min(0, "Kas akhir tidak boleh negatif."),
  note: z.string().optional().nullable(),
});

export const paymentMethodSchema = z.object({
  name: z.string().min(2, "Nama metode pembayaran minimal 2 karakter."),
  isActive: z.boolean().default(true),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  modifierId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int(),
  note: z.string().optional().nullable(),
});

export const modifierGroupSchema = z.object({
  name: z.string().min(2, "Nama grup topping minimal 2 karakter."),
  description: z.string().optional().nullable(),
  minSelect: z.coerce.number().int().min(0, "Minimal pilih tidak boleh negatif."),
  maxSelect: z.coerce.number().int().min(1, "Maksimal pilih minimal 1."),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine((data) => data.maxSelect >= data.minSelect, {
  message: "maxSelect tidak boleh lebih kecil dari minSelect.",
  path: ["maxSelect"],
});

export const modifierSchema = z.object({
  modifierGroupId: z.string().uuid("Grup topping wajib dipilih."),
  name: z.string().min(2, "Nama topping minimal 2 karakter."),
  price: z.coerce.number().min(0, "Harga tambahan tidak boleh negatif."),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
  isStockTracked: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
