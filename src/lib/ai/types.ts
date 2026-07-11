export type ProductDraft = {
  name: string;
  basePrice?: number;
  description?: string;
  categoryName?: string;
  variants?: { name: string; priceAdjustment: number }[];
  toppings?: { name: string; price: number }[];
};
