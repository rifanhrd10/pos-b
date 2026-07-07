"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductRecommendations } from "@/lib/ai/provider";
import { scanMenuByGemini } from "@/lib/ai/gemini";
import type { ProductDraft } from "@/lib/ai/types";

// Get recommendations based on current business type
export async function getRecommendations() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, type: true },
  });
  if (!business) return { error: "Business not found" };

  const result = await getProductRecommendations(business.type);
  return {
    success: true as const,
    businessType: business.type,
    templates: result.templates,
    gemini: result.gemini,
    geminiError: result.geminiError,
  };
}

// Bulk create selected recommendations
export async function createRecommendedProducts(drafts: ProductDraft[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!business) return { error: "Business not found" };

  // Upsert categories by name within business and create products
  for (const draft of drafts) {
    let categoryId: string | null = null;

    if (draft.categoryName) {
      const category = await prisma.category.upsert({
        where: {
          businessId_name: {
            businessId: business.id,
            name: draft.categoryName,
          },
        },
        update: {},
        create: {
          businessId: business.id,
          name: draft.categoryName,
        },
      });
      categoryId = category.id;
    }

    await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId,
        name: draft.name,
        description: draft.description,
        basePrice: draft.basePrice ?? 0,
        variants: draft.variants?.length
          ? {
              create: draft.variants.map((v, i) => ({
                name: v.name,
                priceAdjustment: v.priceAdjustment,
                sortOrder: i,
              })),
            }
          : undefined,
        toppings: draft.toppings?.length
          ? {
              create: draft.toppings.map((t) => ({
                name: t.name,
                price: t.price,
              })),
            }
          : undefined,
      },
    });
  }

  return { success: true };
}

export async function scanMenuImage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 5MB" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");

  try {
    const result = await scanMenuByGemini(base64, file.type);
    if (!result.success) {
      return { error: result.error };
    }
    return { success: true, drafts: result.data };
  } catch (err: any) {
    return { error: err.message ?? "Gagal memproses gambar" };
  }
}
