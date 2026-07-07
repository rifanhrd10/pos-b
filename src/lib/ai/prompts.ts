export function buildRecommendPrompt(businessType: string): string {
  return `You are a restaurant business consultant.
Your client is a "${businessType}" business.
Based on this business type, suggest 8-10 products they should sell.

Return ONLY a JSON array. No explanation. No markdown.
Each item format: {"name": "...", "basePrice": number, "description": "...", "categoryName": "..."}

Examples of business types and their typical products:
- COFFEE_SHOP → espresso, latte, cappuccino, matcha, croissant
- RESTAURANT → nasi goreng, ayam bakar, sate, es teh
- VAPE_STORE → device starter kit, liquid, pod, coil
- BARBERSHOP → potong rambut, creambath, shave
- LAUNDRY → cuci kiloan, setrika, bed cover
- FNB → similar to restaurant but with snacks
- OTHER → general retail products

Adapt the suggestions to the local Indonesian market context.
Use Indonesian product names where appropriate.
Prices in IDR (Rupiah).`;
}

export function buildMenuScanPrompt(): string {
  return `You are a menu parser for a point-of-sale system.
Analyze the uploaded menu image and extract ALL items.

Return ONLY a JSON array. No explanation. No markdown wrapping.
Each item: {"name": "...", "basePrice": number, "description": "...", "categoryName": "..."}

If you cannot read the image, return: {"error": "Gambar tidak jelas"}
If the image is not a menu, return: {"error": "Gambar bukan menu"}

Rules:
- Base price in IDR
- Category name is the product group (e.g. "Makanan", "Minuman", "Coffee", "Snack")
- If price not visible, set basePrice to 0 (user will edit)
- Only return items clearly visible in the image`;
}
