import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProductDraft } from "./types";
import { buildRecommendPrompt, buildMenuScanPrompt } from "./prompts";

function getClient(ownerApiKey?: string | null) {
  const apiKey = ownerApiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key belum diatur oleh owner");
  return new GoogleGenerativeAI(apiKey);
}

export async function recommendProductsByGemini(
  businessType: string,
  ownerApiKey?: string | null,
): Promise<{ success: true; data: ProductDraft[] } | { success: false; error: string }> {
  try {
    const genAI = getClient(ownerApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildRecommendPrompt(businessType);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = JSON.parse(cleaned);

    if (!Array.isArray(data)) {
      return { success: false, error: "Invalid response format" };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Gemini API error" };
  }
}

export async function scanMenuByGemini(
  base64Image: string,
  mimeType: string,
  ownerApiKey?: string | null,
): Promise<{ success: true; data: ProductDraft[] } | { success: false; error: string }> {
  try {
    const genAI = getClient(ownerApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = buildMenuScanPrompt();

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = JSON.parse(cleaned);

    if (data.error) {
      return { success: false, error: data.error };
    }
    if (!Array.isArray(data)) {
      return { success: false, error: "Invalid response format" };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Gemini API error" };
  }
}
