import type { ProductDraft } from "./types";
import { getBuiltInRecommendations } from "./templates";
import { recommendProductsByGemini } from "./gemini";

export async function getProductRecommendations(
  businessType: string
): Promise<{ templates: ProductDraft[]; gemini: ProductDraft[]; geminiError: string | null }> {
  const templates = getBuiltInRecommendations(businessType);

  let gemini: ProductDraft[] = [];
  let geminiError: string | null = null;

  try {
    const geminiResult = await recommendProductsByGemini(businessType);
    if (geminiResult.success) {
      gemini = geminiResult.data;
    } else {
      geminiError = geminiResult.error;
    }
  } catch (err: any) {
    geminiError = err.message ?? "Unknown error";
  }

  return { templates, gemini, geminiError };
}
