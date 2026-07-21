"use client";

import { useState } from "react";
import { Search, ChevronLeft, Layers, Plus, ShoppingBag, X } from "lucide-react";
import type { PosProduct } from "@/actions/kasir";

interface ProductCatalogProps {
  products: PosProduct[];
  categories: Array<{ id: string; name: string }>;
  onAddProduct: (
    product: PosProduct,
    variantId?: string,
    toppingIds?: string[],
    variantSelections?: Array<{ groupId: string; optionId: string }>
  ) => void;
  activeTableName: string;
  onBackToTables: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export function ProductCatalog({
  products,
  categories,
  onAddProduct,
  activeTableName,
  onBackToTables,
}: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Variant/Topping picker state
  const [pickerProduct, setPickerProduct] = useState<PosProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({});
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleProductClick = (product: PosProduct) => {
    if (product.hasVariants || product.hasTopping) {
      setPickerProduct(product);
      setSelectedVariantId(product.variants[0]?.id || null);
      setSelectedVariantOptions(
        Object.fromEntries(
          product.variantGroups
            .map((group) => [group.id, group.options[0]?.id])
            .filter((entry): entry is [string, string] => Boolean(entry[1]))
        )
      );
      setSelectedToppingIds([]);
    } else {
      onAddProduct(product);
    }
  };

  const handleAddFromPicker = () => {
    if (!pickerProduct) return;
    const variantSelections = Object.entries(selectedVariantOptions).map(([groupId, optionId]) => ({ groupId, optionId }));
    onAddProduct(pickerProduct, selectedVariantId || undefined, selectedToppingIds, variantSelections);
    setPickerProduct(null);
    setSelectedVariantId(null);
    setSelectedVariantOptions({});
    setSelectedToppingIds([]);
  };

  const getVariantPrice = () => {
    if (!pickerProduct) return 0;
    if (pickerProduct.variantGroups.length > 0) {
      const adjustment = pickerProduct.variantGroups.reduce((sum, group) => {
        const selectedOptionId = selectedVariantOptions[group.id];
        const option = group.options.find((item) => item.id === selectedOptionId);
        return sum + (option?.priceAdjustment || 0);
      }, 0);
      return pickerProduct.basePrice + adjustment;
    }
    if (!selectedVariantId) return pickerProduct.basePrice;
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

  const getTotalPrice = () => getVariantPrice() + getToppingTotal();

  const toggleTopping = (toppingId: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Top action row */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
        <button
          onClick={onBackToTables}
          className="p-2.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold text-xs"
          title="Kembali ke Denah Meja"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" /> Denah Meja
        </button>

        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Active Table Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Melayani: <span className="text-emerald-600 font-extrabold font-mono">{activeTableName}</span>
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari menu makanan atau minuman..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl transition-all outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryId === null
              ? "bg-blue-600 text-white shadow-lg shadow-blue-250"
              : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
          }`}
          type="button"
        >
          <Layers className="w-3.5 h-3.5" /> Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              selectedCategoryId === cat.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-250"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
            type="button"
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className="grid grid-cols-3 gap-3.5">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between h-56 text-left"
              type="button"
            >
              {/* Product Image */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                {product.categoryName && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                    {product.categoryName}
                  </span>
                )}
                {product.hasVariants && (
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-blue-600/90 text-[9px] font-bold text-white">
                    Varian
                  </span>
                )}
              </div>

              {/* Product Content */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900 font-mono">
                    {formatCurrency(product.basePrice)}
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 mt-2">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-medium">Menu &ldquo;{searchTerm}&rdquo; tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Variant/Topping Picker Modal */}
      {pickerProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{pickerProduct.name}</h3>
              <button
                onClick={() => setPickerProduct(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Variants */}
            {pickerProduct.variantGroups.length > 0 && (
              <div className="mb-4">
                <label className="block text-slate-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Pilih Varian
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {pickerProduct.variantGroups.map((group) => (
                    <div key={group.id} className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-slate-800">{group.name}</h4>
                        {group.isRequired ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">Wajib</span> : null}
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {group.options.map((option) => {
                          const active = selectedVariantOptions[group.id] === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setSelectedVariantOptions((current) => ({ ...current, [group.id]: option.id }))}
                              className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold transition ${
                                active
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                              }`}
                            >
                              {option.name}
                              {option.priceAdjustment > 0 ? ` +${formatCurrency(option.priceAdjustment)}` : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pickerProduct.variantGroups.length === 0 && pickerProduct.hasVariants && (
              <div className="mb-4">
                <label className="block text-slate-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Pilih Varian
                </label>
                <div className="space-y-2">
                  {pickerProduct.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedVariantId === variant.id
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="variant"
                        value={variant.id}
                        checked={selectedVariantId === variant.id}
                        onChange={() => setSelectedVariantId(variant.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="text-slate-800 font-medium text-sm">{variant.name}</div>
                        {variant.priceAdjustment !== 0 && (
                          <div className="text-slate-400 text-xs">
                            {variant.priceAdjustment > 0 ? "+" : ""}
                            {formatCurrency(variant.priceAdjustment)}
                          </div>
                        )}
                      </div>
                      <div className="text-slate-800 font-bold text-sm font-mono">
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
                <label className="block text-slate-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Pilih Topping
                </label>
                <div className="space-y-2">
                  {pickerProduct.toppings.map((topping) => (
                    <label
                      key={topping.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedToppingIds.includes(topping.id)
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedToppingIds.includes(topping.id)}
                        onChange={() => toggleTopping(topping.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-slate-800 font-medium text-sm">{topping.name}</div>
                      </div>
                      <div className="text-slate-800 font-bold text-sm font-mono">
                        +{formatCurrency(topping.price)}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Total and CTA */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-medium text-sm">Total</span>
                <span className="text-slate-900 text-xl font-black font-mono">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
              <button
                onClick={handleAddFromPicker}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-blue-100"
                type="button"
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
