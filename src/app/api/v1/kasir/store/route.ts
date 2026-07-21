import { z } from "zod";
import { apiError, MobileApiError, noStoreJson } from "@/lib/mobile-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(1).max(50),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new MobileApiError(422, "VALIDATION_ERROR", "Kode toko tidak boleh kosong");
    }

    const business = await prisma.business.findFirst({
      where: {
        storeCode: {
          equals: parsed.data.code.toUpperCase(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        logo: true,
        phone: true,
        address: true,
        settings: {
          select: {
            receiptHeader1: true,
            receiptHeader2: true,
            receiptHeader3: true,
            receiptFooter: true,
            receiptShowLogo: true,
            receiptShowAddress: true,
            receiptShowPhone: true,
            receiptShowKasir: true,
            receiptThankYou: true,
          },
        },
        outlets: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            isActive: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!business) {
      throw new MobileApiError(404, "STORE_CODE_NOT_FOUND", "Kode toko tidak ditemukan");
    }

    return noStoreJson({
      business: {
        id: business.id,
        name: business.name,
        logo: business.logo,
        phone: business.phone,
        address: business.address,
        receiptSettings: business.settings
          ? {
              header1: business.settings.receiptHeader1,
              header2: business.settings.receiptHeader2,
              header3: business.settings.receiptHeader3,
              footer: business.settings.receiptFooter,
              showLogo: business.settings.receiptShowLogo,
              showAddress: business.settings.receiptShowAddress,
              showPhone: business.settings.receiptShowPhone,
              showKasir: business.settings.receiptShowKasir,
              thankYou: business.settings.receiptThankYou,
            }
          : null,
      },
      outlets: business.outlets,
      // Profil kasir sengaja tidak diekspos. PIN akan menentukan kasir pada outlet terpilih.
      cashiers: [],
    });
  } catch (error) {
    return apiError(error);
  }
}
