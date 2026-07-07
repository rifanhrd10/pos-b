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
