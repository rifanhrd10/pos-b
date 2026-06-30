"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Landmark,
  Minus,
  Pencil,
  Plus,
  QrCode,
  ShoppingCart,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { emitToast } from "@/components/ui/toast-provider";
import { rupiah } from "@/lib/utils";

type Category = { id: string; name: string };
type ModifierOption = { id: string; name: string; price: number };
type ProductModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  modifiers: ModifierOption[];
};
type Product = {
  id: string;
  name: string;
  imageUrl: string | null;
  sellPrice: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  modifierGroups: ProductModifierGroup[];
};

type CartModifierSelection = {
  groupId: string;
  groupName: string;
  modifiers: ModifierOption[];
};

type CartItem = {
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  note?: string;
  selections: CartModifierSelection[];
};

function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function appendCurrencyDigit(currentValue: string, digit: string) {
  const digits = currentValue.replace(/\D/g, "");
  const nextDigits = `${digits}${digit}`.replace(/^0+(\d)/, "$1");
  return formatCurrencyInput(nextDigits);
}

function removeCurrencyDigit(currentValue: string) {
  const digits = currentValue.replace(/\D/g, "");
  const nextDigits = digits.slice(0, -1);
  return formatCurrencyInput(nextDigits);
}

function getPaymentIcon(name: string) {
  const label = name.toLowerCase();
  if (label.includes("cash") || label.includes("tunai")) return Banknote;
  if (label.includes("qris") || label.includes("qr")) return QrCode;
  if (label.includes("transfer") || label.includes("bank")) return Landmark;
  if (label.includes("card") || label.includes("kartu") || label.includes("debit") || label.includes("kredit")) return CreditCard;
  return WalletCards;
}

const HOLD_ORDERS_KEY = "bayaro-pos-hold-orders";

type HoldOrder = {
  id: string;
  label: string;
  createdAt: string;
  cart: CartItem[];
  selectedPayment: string;
  paidAmountInput: string;
};

export function PosScreen({
  products,
  categories,
  outletId,
  cashierId,
  shiftId,
  paymentMethods,
}: {
  products: Product[];
  categories: Category[];
  outletId: string;
  cashierId: string;
  shiftId?: string | null;
  paymentMethods: { id: string; name: string; isAddon: boolean }[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]?.id || "");
  const [checkingOut, setCheckingOut] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectionState, setSelectionState] = useState<Record<string, string[]>>({});
  const [itemNote, setItemNote] = useState("");
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [holdOrders, setHoldOrders] = useState<HoldOrder[]>([]);
  const [showPaymentPad, setShowPaymentPad] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
        const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [products, query, selectedCategory],
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total +
        (item.basePrice +
          item.selections.flatMap((selection) => selection.modifiers).reduce((sum, mod) => sum + mod.price, 0)) *
          item.quantity,
    0,
  );
  const totalDue = subtotal * 1.2;
  const paidAmount = parseCurrencyInput(paidAmountInput);
  const changeAmount = Math.max(0, paidAmount - totalDue);
  const remainingAmount = Math.max(0, totalDue - paidAmount);
  const quickAmounts = [
    totalDue,
    Math.ceil(totalDue / 5000) * 5000,
    Math.ceil(totalDue / 10000) * 10000,
    Math.ceil(totalDue / 50000) * 50000,
  ].filter((amount, index, array) => amount > 0 && array.indexOf(amount) === index);
  const keypadButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem(HOLD_ORDERS_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as HoldOrder[];
      setHoldOrders(parsed);
    } catch {
      window.sessionStorage.removeItem(HOLD_ORDERS_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(HOLD_ORDERS_KEY, JSON.stringify(holdOrders));
  }, [holdOrders]);

  function openProduct(product: Product) {
    if (!product.modifierGroups.length) {
      addProduct(product, [], "");
      return;
    }

    const defaults = Object.fromEntries(
      product.modifierGroups.map((group) => [group.id, group.modifiers.slice(0, group.minSelect).map((item) => item.id)]),
    );
    setSelectionState(defaults);
    setItemNote("");
    setEditingCartIndex(null);
    setActiveProduct(product);
  }

  function openEditCartItem(index: number) {
    const item = cart[index];
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) {
      emitToast({ tone: "error", title: "Produk tidak ditemukan untuk diedit" });
      return;
    }

    const currentSelections = Object.fromEntries(
      product.modifierGroups.map((group) => {
        const selectedIds =
          item.selections.find((selection) => selection.groupId === group.id)?.modifiers.map((modifier) => modifier.id) || [];
        return [group.id, selectedIds];
      }),
    );

    setSelectionState(currentSelections);
    setItemNote(item.note || "");
    setEditingCartIndex(index);
    setActiveProduct(product);
  }

  function addProduct(product: Product, selections: CartModifierSelection[], note: string) {
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      basePrice: product.sellPrice,
      quantity: 1,
      note,
      selections,
    };

    setCart((prev) =>
      editingCartIndex !== null
        ? prev.map((item, index) =>
            index === editingCartIndex
              ? { ...item, selections: cartItem.selections, note: cartItem.note }
              : item,
          )
        : [...prev, cartItem],
    );
    setActiveProduct(null);
    setSelectionState({});
    setItemNote("");
    setEditingCartIndex(null);
    emitToast({
      tone: "success",
      title: editingCartIndex !== null ? "Item keranjang diperbarui" : "Item masuk ke keranjang",
      description: product.name,
    });
  }

  function toggleModifier(group: ProductModifierGroup, modifierId: string) {
    setSelectionState((current) => {
      const selected = current[group.id] || [];
      const exists = selected.includes(modifierId);

      if (exists) {
        if (selected.length <= group.minSelect) {
          emitToast({
            tone: "info",
            title: "Pilihan minimum belum terpenuhi",
            description: `${group.name} minimal pilih ${group.minSelect}.`,
          });
          return current;
        }
        return { ...current, [group.id]: selected.filter((id) => id !== modifierId) };
      }

      if (selected.length >= group.maxSelect) {
        if (group.maxSelect === 1) {
          return { ...current, [group.id]: [modifierId] };
        }
        emitToast({
          tone: "info",
          title: "Pilihan melebihi batas",
          description: `${group.name} maksimal pilih ${group.maxSelect}.`,
        });
        return current;
      }

      return { ...current, [group.id]: [...selected, modifierId] };
    });
  }

  function confirmSelections() {
    if (!activeProduct) return;

    for (const group of activeProduct.modifierGroups) {
      const selectedIds = selectionState[group.id] || [];
      if (selectedIds.length < group.minSelect) {
        emitToast({
          tone: "error",
          title: "Topping belum lengkap",
          description: `${group.name} minimal pilih ${group.minSelect}.`,
        });
        return;
      }
      if (selectedIds.length > group.maxSelect) {
        emitToast({
          tone: "error",
          title: "Topping melebihi batas",
          description: `${group.name} maksimal pilih ${group.maxSelect}.`,
        });
        return;
      }
    }

    const selections = activeProduct.modifierGroups
      .map((group) => ({
        groupId: group.id,
        groupName: group.name,
        modifiers: group.modifiers.filter((modifier) => (selectionState[group.id] || []).includes(modifier.id)),
      }))
      .filter((group) => group.modifiers.length > 0);

    addProduct(activeProduct, selections, itemNote);
  }

  async function checkout() {
    if (!cart.length) {
      emitToast({ tone: "info", title: "Keranjang masih kosong" });
      return;
    }

    if (paidAmount < totalDue) {
      emitToast({
        tone: "error",
        title: "Nominal bayar belum cukup",
        description: `Minimal pembayaran ${rupiah(totalDue)}.`,
      });
      return;
    }

    setCheckingOut(true);
    const response = await fetch("/api/pos/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outletId,
        cashierId,
        shiftId,
        discountTotal: 0,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          note: item.note,
          modifiers: item.selections
            .flatMap((selection) => selection.modifiers)
            .map((modifier) => ({ modifierId: modifier.id, quantity: 1 })),
        })),
        payments: [{ paymentMethodId: selectedPayment, amount: paidAmount }],
      }),
    });
    const result = await response.json();
    setCheckingOut(false);

    if (!response.ok) {
      emitToast({ tone: "error", title: "Checkout gagal", description: result.message });
      return;
    }

    setCart([]);
    setPaidAmountInput("");
    emitToast({ tone: "success", title: "Checkout berhasil", description: result.transactionNumber });
  }

  function holdCurrentOrder() {
    if (!cart.length) {
      emitToast({ tone: "info", title: "Belum ada pesanan untuk disimpan" });
      return;
    }

    const orderNumber = holdOrders.length + 1;
    const order: HoldOrder = {
      id: crypto.randomUUID(),
      label: `Hold #${orderNumber}`,
      createdAt: new Date().toISOString(),
      cart,
      selectedPayment,
      paidAmountInput,
    };

    setHoldOrders((current) => [order, ...current].slice(0, 8));
    setCart([]);
    setPaidAmountInput("");
    emitToast({ tone: "success", title: "Pesanan disimpan", description: order.label });
  }

  function resumeHoldOrder(orderId: string) {
    const order = holdOrders.find((entry) => entry.id === orderId);
    if (!order) return;

    setCart(order.cart);
    setSelectedPayment(order.selectedPayment || paymentMethods[0]?.id || "");
    setPaidAmountInput(order.paidAmountInput || "");
    setHoldOrders((current) => current.filter((entry) => entry.id !== orderId));
    emitToast({ tone: "success", title: "Pesanan dipanggil kembali", description: order.label });
  }

  function removeHoldOrder(orderId: string) {
    setHoldOrders((current) => current.filter((entry) => entry.id !== orderId));
    emitToast({ tone: "success", title: "Pesanan hold dihapus" });
  }

  const content = (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-[28px] bg-white p-4 shadow-soft">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <Input placeholder="Cari produk untuk transaksi..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
            >
              <option value="all">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              className="overflow-hidden rounded-[28px] bg-white text-left shadow-soft transition hover:-translate-y-1"
              onClick={() => openProduct(product)}
            >
              <div className="flex aspect-square items-center justify-center bg-slate-50 p-4">
                <Image
                  src={product.imageUrl || "/images/products/product-placeholder.svg"}
                  alt={product.name}
                  width={520}
                  height={520}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.categoryName}</p>
                  </div>
                  {product.modifierGroups.length ? <Badge tone="info">Topping</Badge> : null}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-bayaro-navy">{rupiah(product.sellPrice)}</span>
                  <span className="text-slate-500">Stok {product.stock}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <aside className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-bayaro-soft p-3">
              <ShoppingCart size={18} className="text-bayaro-blue" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Keranjang Kasir</p>
              <p className="text-sm text-slate-500">{cart.length} item aktif</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Kembali ke dashboard"
            title="Kembali ke dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
        </div>

        <div className="mt-5 rounded-[28px] bg-[#071a49] p-5 text-white shadow-[0_18px_40px_rgba(7,26,73,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">Total Bayar</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{rupiah(totalDue)}</p>
          <div className="mt-4 flex items-center justify-between text-sm text-blue-100/80">
            <span>Subtotal</span>
            <span>{rupiah(subtotal)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="justify-center"
            onClick={() => {
              if (!cart.length) return;
              setCart([]);
              emitToast({ tone: "success", title: "Keranjang dibersihkan" });
            }}
            disabled={!cart.length || checkingOut}
          >
            Clear Cart
          </Button>
          <Button
            variant="secondary"
            className="justify-center"
            onClick={holdCurrentOrder}
            disabled={checkingOut || !cart.length}
          >
            Hold
          </Button>
        </div>

        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Pesanan Hold</p>
            <Badge tone="info">{holdOrders.length}</Badge>
          </div>
          <div className="mt-3 space-y-3">
            {holdOrders.length ? (
              holdOrders.map((order) => (
                <div key={order.id} className="rounded-2xl bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{order.label}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.cart.length} item • {new Intl.DateTimeFormat("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHoldOrder(order.id)}
                      className="rounded-xl p-2 text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Button className="mt-3 w-full" variant="secondary" onClick={() => resumeHoldOrder(order.id)}>
                    Panggil Pesanan
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Belum ada pesanan yang di-hold.</p>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {cart.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada item. Klik produk untuk menambahkan ke keranjang.</p>
          ) : null}
          {cart.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="rounded-3xl border border-slate-200 p-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{rupiah(item.basePrice)}</p>
                  </div>
                  <button
                    onClick={() => setCart((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                    className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {item.selections.flatMap((selection) => selection.modifiers).length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.selections.flatMap((selection) => selection.modifiers).map((modifier) => (
                      <Badge key={modifier.id} tone="default">
                        {modifier.name} +{rupiah(modifier.price)}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {item.note ? <p className="mt-2 text-xs text-slate-500">Catatan: {item.note}</p> : null}

                <div className="mt-3">
                  <button
                    onClick={() => openEditCartItem(index)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil size={12} />
                    Edit topping
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-xl border border-slate-200 p-2"
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((cartItem, currentIndex) =>
                            currentIndex === index
                              ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
                              : cartItem,
                          ),
                        )
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      className="rounded-xl border border-slate-200 p-2"
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((cartItem, currentIndex) =>
                            currentIndex === index ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                          ),
                        )
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="font-semibold text-bayaro-navy">
                    {rupiah(
                      (item.basePrice +
                        item.selections.flatMap((selection) => selection.modifiers).reduce((sum, mod) => sum + mod.price, 0)) *
                        item.quantity,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4 rounded-[28px] bg-slate-50 p-4">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">Metode pembayaran</label>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Pilih 1
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPayment(method.id)}
                  className={`flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-[22px] border px-3 py-2.5 text-center text-sm transition ${
                    selectedPayment === method.id
                      ? "border-bayaro-blue bg-blue-50 text-bayaro-navy shadow-[0_10px_24px_rgba(19,95,239,0.12)]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="line-clamp-2 min-h-[32px] text-[13px] font-semibold leading-snug">{method.name}</span>
                  {(() => {
                    const Icon = getPaymentIcon(method.name);
                    return (
                      <span
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          selectedPayment === method.id ? "bg-white text-bayaro-blue" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={20} />
                      </span>
                    );
                  })()}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Pajak + service</span>
              <span className="font-semibold text-slate-900">{rupiah(totalDue - subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Dihitung otomatis dari konfigurasi outlet aktif.</p>
          </div>
          <div className="rounded-[24px] bg-white p-4">
            <button
              type="button"
              onClick={() => setShowPaymentPad((current) => !current)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">Nominal bayar</p>
                <p className="mt-1 text-sm text-slate-500">{paidAmountInput || "Tap untuk input nominal bayar"}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                {showPaymentPad ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </button>

            {showPaymentPad ? (
              <>
                <div className="mt-4">
                  <Input
                    value={paidAmountInput}
                    onChange={(event) => setPaidAmountInput(formatCurrencyInput(event.target.value))}
                    inputMode="numeric"
                    placeholder="Rp 0"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setPaidAmountInput(formatCurrencyInput(String(amount)))}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {amount === totalDue ? "Uang Pas" : rupiah(amount)}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {keypadButtons.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaidAmountInput((current) => appendCurrencyDigit(current, key))}
                      className="rounded-2xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPaidAmountInput("")}
                    className="rounded-2xl border border-rose-200 px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidAmountInput((current) => removeCurrencyDigit(current))}
                    className="rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Hapus
                  </button>
                </div>
              </>
            ) : null}

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Sisa bayar</span>
                <span className={`font-semibold ${remainingAmount > 0 ? "text-amber-600" : "text-slate-900"}`}>
                  {rupiah(remainingAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Kembalian</span>
                <span className={`font-semibold ${changeAmount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                  {rupiah(changeAmount)}
                </span>
              </div>
            </div>
          </div>
          <Button className="h-14 w-full text-base" onClick={() => void checkout()} disabled={checkingOut}>
            {checkingOut ? "Memproses pembayaran..." : "Bayar Sekarang"}
          </Button>
        </div>
      </aside>

      {activeProduct ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4">
          <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
            <div className="w-full overflow-hidden rounded-[32px] bg-white shadow-soft">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Pilih Topping</h2>
                  <p className="mt-1 text-sm text-slate-500">{activeProduct.name}</p>
                </div>
                <button
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  onClick={() => {
                    setActiveProduct(null);
                    setEditingCartIndex(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[260px_1fr]">
                <div>
                  <Image
                    src={activeProduct.imageUrl || "/images/products/product-placeholder.svg"}
                    alt={activeProduct.name}
                    width={600}
                    height={420}
                    className="h-52 w-full rounded-[28px] object-cover"
                  />
                  <div className="mt-4 rounded-[28px] bg-bayaro-soft p-4">
                    <p className="text-sm text-slate-500">Harga dasar</p>
                    <p className="mt-2 text-xl font-semibold text-bayaro-navy">{rupiah(activeProduct.sellPrice)}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {activeProduct.modifierGroups.map((group) => {
                    const selectedIds = selectionState[group.id] || [];
                    return (
                      <div key={group.id} className="rounded-[28px] border border-slate-100 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{group.name}</p>
                          <Badge tone={group.minSelect > 0 ? "warning" : "info"}>
                            Min {group.minSelect} • Max {group.maxSelect}
                          </Badge>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {group.modifiers.map((modifier) => {
                            const selected = selectedIds.includes(modifier.id);
                            return (
                              <button
                                key={modifier.id}
                                type="button"
                                onClick={() => toggleModifier(group, modifier.id)}
                                className={`rounded-2xl border px-4 py-3 text-left transition ${
                                  selected
                                    ? "border-bayaro-blue bg-blue-50 text-bayaro-navy"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium">{modifier.name}</span>
                                  <span className="text-sm font-semibold">{rupiah(modifier.price)}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Catatan item</label>
                    <textarea
                      value={itemNote}
                      onChange={(event) => setItemNote(event.target.value)}
                      placeholder="Contoh: less ice, tanpa sambal"
                      className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setActiveProduct(null);
                        setEditingCartIndex(null);
                      }}
                    >
                      Batal
                    </Button>
                    <Button onClick={confirmSelections}>
                      {editingCartIndex !== null ? "Simpan Perubahan" : "Tambah ke Keranjang"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  return content;
}
