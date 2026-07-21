import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const businessSetupSchema = z.object({
  name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  type: z.enum(["COFFEE_SHOP", "RESTAURANT", "VAPE_STORE", "BARBERSHOP", "RETAIL", "FNB", "LAUNDRY", "OTHER"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

export const outletSetupSchema = z.object({
  name: z.string().min(2, "Nama outlet minimal 2 karakter"),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export const employeeSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Role wajib dipilih"),
  outletIds: z.array(z.string()).min(1, "Minimal 1 outlet harus dipilih"),
  pin: z.string().min(4).max(6).optional().or(z.literal("")),
});

export const outletSchema = z.object({
  name: z.string().min(2, "Nama outlet minimal 2 karakter"),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  phone: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export const roleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Minimal 1 permission harus dipilih"),
});

export const planSelectionSchema = z.object({
  planId: z.string().min(1, "Plan wajib dipilih"),
});

export const shiftItemSchema = z.object({
  name: z.string().min(1, "Nama shift wajib diisi"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:mm)"),
});

export const multiOutletSchema = z.object({
  hasMultiOutlet: z.boolean(),
  outlets: z
    .array(
      z.object({
        name: z.string().min(2, "Nama outlet minimal 2 karakter"),
        address: z.string().optional(),
        city: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .optional(),
});

export const operationsSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tidak valid"),
  hasShift: z.boolean(),
  shifts: z.array(shiftItemSchema).optional(),
});

export const businessSetupSchemaV2 = z.object({
  name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  type: z.enum(["COFFEE_SHOP", "RESTAURANT", "VAPE_STORE", "BARBERSHOP", "RETAIL", "FNB", "LAUNDRY", "OTHER"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  npwp: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
});

export const variantSchema = z.object({
  name: z.string().min(1, "Nama varian wajib diisi"),
  priceAdjustment: z.coerce.number().min(0, "Harga tambahan tidak valid"),
  stock: z.coerce.number().min(0, "Stok tidak valid").optional(),
});

export const toppingSchema = z.object({
  name: z.string().min(1, "Nama topping wajib diisi"),
  price: z.coerce.number().min(0, "Harga topping tidak valid"),
});

export const masterVariantSchema = z.object({
  name: z.string().min(2, "Nama varian minimal 2 karakter"),
  isActive: z.boolean().optional(),
});

export const masterVariantOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama pilihan varian wajib diisi"),
  priceAdjustment: z.coerce.number().min(0, "Harga tambahan tidak valid"),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const masterToppingSchema = z.object({
  name: z.string().min(2, "Nama topping minimal 2 karakter"),
  price: z.coerce.number().min(0, "Harga tambahan tidak valid"),
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Harga jual tidak valid"),
  costPrice: z.coerce.number().min(0, "Harga modal tidak valid").optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  image: z.string().optional(),
  trackStock: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
  toppings: z.array(toppingSchema).optional(),
});

// Inventory schemas

export const adjustStockSchema = z.object({
  outletId: z.string().min(1, "Outlet wajib dipilih"),
  productId: z.string().min(1, "Produk wajib dipilih"),
  variantId: z.string().optional(),
  quantity: z.number().int("Jumlah harus bilangan bulat").min(0, "Jumlah tidak boleh negatif"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  note: z.string().optional(),
  reference: z.string().optional(),
});

export const setMinStockSchema = z.object({
  stockId: z.string().min(1),
  minStock: z.number().int().min(0, "Min stok tidak boleh negatif"),
});

export const createTransferSchema = z.object({
  fromOutletId: z.string().min(1, "Outlet asal wajib dipilih"),
  toOutletId: z.string().min(1, "Outlet tujuan wajib dipilih"),
  note: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1, "Jumlah minimal 1"),
  })).min(1, "Minimal 1 item transfer"),
}).refine(data => data.fromOutletId !== data.toOutletId, {
  message: "Outlet asal dan tujuan tidak boleh sama",
  path: ["toOutletId"],
});

export const submitOpnameSchema = z.object({
  outletId: z.string().min(1),
  items: z.array(z.object({
    stockId: z.string().min(1),
    actualQty: z.number().int().min(0, "Jumlah tidak boleh negatif"),
  })).min(1, "Minimal 1 item opname"),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type SetMinStockInput = z.infer<typeof setMinStockSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type SubmitOpnameInput = z.infer<typeof submitOpnameSchema>;

// ─── Settings schemas ────────────────────────────────────────────────────────

export const updateBusinessProfileSchema = z.object({
  name: z.string().min(1, "Nama bisnis wajib diisi"),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  province: z.string().optional(),
})

export const updateTaxSettingsSchema = z.object({
  taxRate: z.number().min(0).max(100),
  serviceRate: z.number().min(0).max(100),
})

export const updateReceiptTemplateSchema = z.object({
  receiptHeader1: z.string().optional(),
  receiptHeader2: z.string().optional(),
  receiptHeader3: z.string().optional(),
  receiptFooter: z.string().optional(),
  receiptShowLogo: z.boolean().optional(),
  receiptShowAddress: z.boolean().optional(),
  receiptShowPhone: z.boolean().optional(),
  receiptShowKasir: z.boolean().optional(),
  receiptNumberFormat: z.string().optional(),
  receiptThankYou: z.string().optional(),
})

export const updateGeneralSettingsSchema = z.object({
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]),
  language: z.enum(["id", "en"]),
  autoPrintReceipt: z.boolean(),
})

export const createPaymentMethodSchema = z.object({
  type: z.enum(["CASH", "QRIS_STATIC", "QRIS_DYNAMIC", "BANK_TRANSFER", "EWALLET"]),
  name: z.string().min(1, "Nama metode pembayaran wajib diisi"),
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  qrisImage: z.string().optional(),
  qrisNote: z.string().optional(),
  provider: z.enum(["MIDTRANS", "XENDIT", "CUSTOM"]).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  apiEndpoint: z.string().optional(),
  merchantId: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  walletNumber: z.string().optional(),
  walletName: z.string().optional(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
})

export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>
export type UpdateTaxSettingsInput = z.infer<typeof updateTaxSettingsSchema>
export type UpdateReceiptTemplateInput = z.infer<typeof updateReceiptTemplateSchema>
export type UpdateGeneralSettingsInput = z.infer<typeof updateGeneralSettingsSchema>
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
