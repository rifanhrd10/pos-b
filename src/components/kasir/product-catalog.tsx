"use client";

import { useState } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
import type { PosProduct } from "@/actions/kasir";

interface ProductCatalogProps {
  products: PosProduct[];
  categories: Array<{ id: string; name: string }>;
  onAddProduct: (product: PosProduct, variantId?: string, toppingIds?: string[]) => void;
}

export function ProductCatalog({ products, categories, onAddProduct }: ProductCatalogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pickerProduct, setPickerProduct] = useState<PosProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const filteredProducts = products.filter((p) => {
    if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleProductClick = (product: PosProduct) => {
    if (product.hasVariants || product.hasTopping) {
      setPickerProduct(product);
      setSelectedVariantId(product.variants[0]?.id || null);
      setSelectedToppingIds([]);
    } else {
      onAddProduct(product);
    }
  };

  const handleAddFromPicker = () => {
    if (!pickerProduct) return;
    onAddProduct(pickerProduct, selectedVariantId || undefined, selectedToppingIds);
    setPickerProduct(null);
    setSelectedVariantId(null);
    setSelectedToppingIds([]);
  };

  const getVariantPrice = () => {
    if (!pickerProduct || !selectedVariantId) return pickerProduct?.basePrice || 0;
    const variant = pickerProduct.variants.find((v) => v.id === selectedVariantId);
    return pickerProduct.basePrice + (variant?.priceAdjustment || 0);
  };

  const getToppingTotal = () => {
    if (!pickerProduct) return 0;
    return selectedToppingIds.reduce((sum, toppingId) => {
      const topping = pickerProduct.toppings.find((t) => t.id === toppingId);
      return sum + (topping?.price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return getVariantPrice() + getToppingTotal();
  };

  const toggleTopping = (toppingId: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`
            px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-150
            whitespace-nowrap
            ${selectedCategoryId === null ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}
          `}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`
              px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-150
              whitespace-nowrap
              ${selectedCategoryId === cat.id ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3 mt-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="
            bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 pl-10
            text-slate-50 placeholder-slate-400 w-full
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-3 overflow-y-auto flex-1">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="
              bg-slate-700 rounded-xl p-3 cursor-pointer transition-all duration-150
              hover:bg-slate-600 hover:ring-1 hover:ring-blue-500 active:scale-95
              text-left
            "
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="rounded-lg w-full aspect-square object-cover"
              />
            ) : (
              <div className="rounded-lg w-full aspect-square bg-slate-600 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="mt-2 text-slate-50 text-sm font-medium line-clamp-2">{product.name}</div>
            <div className="text-blue-400 text-sm font-bold mt-1">{formatCurrency(product.basePrice)}</div>
            {product.hasVariants && (
              <div className="text-slate-400 text-xs mt-1">• Varian</div>
            )}
          </button>
        ))}
      </div>

      {/* Variant/Topping picker modal */}
      {pickerProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-50">{pickerProduct.name}</h3>
              <button
                onClick={() => setPickerProduct(null)}
                className="text-slate-400 hover:text-slate-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Variants */}
            {pickerProduct.hasVariants && (
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">Pilih Varian</label>
                <div className="space-y-2">
                  {pickerProduct.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
                        ${selectedVariantId === variant.id ? "bg-blue-900/50 border border-blue-500" : "bg-slate-700 hover:bg-slate-600"}
                      `}
                    >
                      <input
                        type="radio"
                        name="variant"
                        value={variant.id}
                        checked={selectedVariantId === variant.id}
                        onChange={() => setSelectedVariantId(variant.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-slate-50 font-medium">{variant.name}</div>
                        {variant.priceAdjustment !== 0 && (
                          <div className="text-slate-400 text-xs">
                            {variant.priceAdjustment > 0 ? "+" : ""}
                            {formatCurrency(variant.priceAdjustment)}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-50 font-bold">
                        {formatCurrency(pickerProduct.basePrice + variant.priceAdjustment)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings */}
            {pickerProduct.hasTopping && (
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">Pilih Topping</label>
                <div className="space-y-2">
                  {pickerProduct.toppings.map((topping) => (
                    <label
                      key={topping.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
                        ${selectedToppingIds.includes(topping.id) ? "bg-blue-900/50 border border-blue-500" : "bg-slate-700 hover:bg-slate-600"}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedToppingIds.includes(topping.id)}
                        onChange={() => toggleTopping(topping.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-slate-50 font-medium">{topping.name}</div>
                      </div>
                      <div className="text-slate-50 font-bold">{formatCurrency(topping.price)}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Total and CTA */}
            <div className="border-t border-slate-700 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-300 font-medium">Total</span>
                <span className="text-slate-50 text-xl font-bold">{formatCurrency(getTotalPrice())}</span>
              </div>
              <button
                onClick={handleAddFromPicker}
                className="
                  w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold
                  rounded-xl transition-all duration-150 cursor-pointer active:scale-95
                "
              >
                Tambah ke Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
