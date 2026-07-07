import type { ProductDraft } from "./types";

const CAT = {
  KOPI: "Minuman Kopi",
  NONKOPI: "Non Coffee",
  MAKANAN: "Makanan",
  PASTRY: "Pastry / Roti",
  SNACK: "Cemilan",
  DEVICE: "Device",
  LIQUID: "Liquid",
  HAIRCUT: "Potong Rambut",
  GROOMING: "Grooming",
  LAUNDRY: "Laundry",
  RETAIL: "Produk Retail",
  VAPE: "Vape",
} as const;

export const BUSINESS_TEMPLATES: Record<string, ProductDraft[]> = {
  COFFEE_SHOP: [
    { name: "Espresso", basePrice: 25000, categoryName: CAT.KOPI },
    { name: "Americano", basePrice: 30000, categoryName: CAT.KOPI },
    { name: "Cappuccino", basePrice: 35000, categoryName: CAT.KOPI },
    { name: "Cafe Latte", basePrice: 35000, categoryName: CAT.KOPI },
    { name: "Matcha Latte", basePrice: 40000, categoryName: CAT.NONKOPI },
    { name: "Croissant", basePrice: 20000, categoryName: CAT.PASTRY },
    { name: "Nasi Goreng", basePrice: 35000, categoryName: CAT.MAKANAN },
  ],
  RESTAURANT: [
    { name: "Nasi Goreng", basePrice: 35000, categoryName: CAT.MAKANAN },
    { name: "Ayam Bakar", basePrice: 40000, categoryName: CAT.MAKANAN },
    { name: "Es Teh Manis", basePrice: 8000, categoryName: CAT.NONKOPI },
    { name: "Jus Alpukat", basePrice: 20000, categoryName: CAT.NONKOPI },
    { name: "Mie Goreng", basePrice: 30000, categoryName: CAT.MAKANAN },
    { name: "Sate Ayam (10 tusuk)", basePrice: 35000, categoryName: CAT.MAKANAN },
  ],
  VAPE_STORE: [
    { name: "Device Starter Kit", basePrice: 150000, categoryName: CAT.DEVICE },
    { name: "Pod System", basePrice: 85000, categoryName: CAT.DEVICE },
    { name: "Liquid 30ml", basePrice: 75000, categoryName: CAT.LIQUID },
    { name: "Salt Nic 30ml", basePrice: 85000, categoryName: CAT.LIQUID },
    { name: "Coil 0.8 ohm (3pcs)", basePrice: 35000, categoryName: CAT.DEVICE },
    { name: "Cotton", basePrice: 25000, categoryName: CAT.DEVICE },
  ],
  BARBERSHOP: [
    { name: "Potong Rambut Reguler", basePrice: 30000, categoryName: CAT.HAIRCUT },
    { name: "Potong Rambut + Cuci Rambut", basePrice: 40000, categoryName: CAT.HAIRCUT },
    { name: "Creambath", basePrice: 60000, categoryName: CAT.GROOMING },
    { name: "Shampoo", basePrice: 15000, categoryName: CAT.HAIRCUT },
    { name: "Hair Tonic", basePrice: 20000, categoryName: CAT.GROOMING },
  ],
  RETAIL: [
    { name: "Pulsa Elektrik", basePrice: 0, categoryName: CAT.RETAIL },
    { name: "Kuota Internet", basePrice: 0, categoryName: CAT.RETAIL },
    { name: "Token Listrik", basePrice: 0, categoryName: CAT.RETAIL },
    { name: "Pembayaran BPJS", basePrice: 0, categoryName: CAT.RETAIL },
  ],
  LAUNDRY: [
    { name: "Cuci Kiloan", basePrice: 8000, categoryName: CAT.LAUNDRY, description: "Per kg" },
    { name: "Cuci + Setrika", basePrice: 12000, categoryName: CAT.LAUNDRY, description: "Per kg" },
    { name: "Setrika Aja", basePrice: 7000, categoryName: CAT.LAUNDRY, description: "Per kg" },
    { name: "Cuci Kering", basePrice: 6000, categoryName: CAT.LAUNDRY, description: "Per kg" },
    { name: "Bed Cover", basePrice: 25000, categoryName: CAT.LAUNDRY },
  ],
};

export function getBuiltInRecommendations(businessType: string): ProductDraft[] {
  return BUSINESS_TEMPLATES[businessType] ?? BUSINESS_TEMPLATES.RETAIL;
}
