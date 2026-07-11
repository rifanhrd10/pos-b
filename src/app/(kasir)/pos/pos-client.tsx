"use client";
import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { KasirNavbar } from "@/components/kasir/kasir-navbar";
import { ShiftModal } from "@/components/kasir/shift-modal";
import { TableSelection } from "@/components/kasir/table-selection";
import { ProductCatalog } from "@/components/kasir/product-catalog";
import { CartPanel } from "@/components/kasir/cart-panel";
import { PaymentModal } from "@/components/kasir/payment-modal";
import { ReceiptModal } from "@/components/kasir/receipt-modal";
import { LaporanPanel } from "@/components/kasir/laporan-panel";
import {
  getOrCreateDraftOrder,
  addOrderItem,
  updateOrderItemQty,
  removeOrderItem,
  getOrderWithItems,
  getShiftSummary,
  type PosProduct,
  type ShiftSummary,
} from "@/actions/kasir";

type OrderWithItems = {
  id: string;
  orderNumber: string;
  tableId: string | null;
  tableName?: string;
  orderType: string;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    variantName: string | null;
    price: number;
    quantity: number;
    subtotal: number;
    notes: string | null;
    toppings: Array<{ id: string; name: string; price: number }>;
  }>;
  promos?: Array<{
    id: string;
    discountAmount: number;
    promo: {
      id: string;
      name: string;
      type: string;
    };
  }>;
  customer?: { id: string; name: string; phone: string | null } | null;
};

interface PosClientProps {
  kasirName: string;
  outletName: string;
  businessName: string;
  businessAddress?: string | null;
  businessPhone?: string | null;
  employeeId: string;
  outletId: string;
  businessId: string;
  activeSession: { id: string; openedAt: Date } | null;
  tables: Array<{ id: string; name: string; capacity: number }>;
  tableStatuses: Array<{
    tableId: string;
    tableName: string;
    status: "AVAILABLE" | "OCCUPIED" | "BILL_REQUESTED";
    orderId?: string | null;
  }>;
  products: PosProduct[];
  categories: Array<{ id: string; name: string }>;
  businessTaxRate: number;
  businessServiceRate: number;
  paymentMethods: Array<{
    id: string;
    type: string;
    name: string;
    qrisImage?: string | null;
    qrisNote?: string | null;
  }>;
  receiptSettings?: {
    header1?: string | null;
    header2?: string | null;
    header3?: string | null;
    footer?: string | null;
    showLogo?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showKasir?: boolean;
    thankYou?: string | null;
  } | null;
}

export function PosClient({
  kasirName,
  outletName,
  businessName,
  businessAddress,
  businessPhone,
  employeeId,
  outletId,
  businessId,
  activeSession,
  tables,
  tableStatuses,
  products,
  categories,
  businessTaxRate,
  businessServiceRate,
  paymentMethods,
  receiptSettings,
}: PosClientProps) {
  const router = useRouter();

  // Session & View states
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
  const [showShiftModal, setShowShiftModal] = useState(!activeSession);
  const [shiftModalMode, setShiftModalMode] = useState<"open" | "close">("open");
  const [sessionId, setSessionId] = useState<string | null>(activeSession?.id || null);
  const [sessionOpenedAt, setSessionOpenedAt] = useState<Date | null>(
    activeSession?.openedAt || null
  );
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);

  // POS flow states — matching pos-kasir-f&b App.tsx flow
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderWithItems | null>(null);

  // Payment & Receipt modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastPayment, setLastPayment] = useState<{
    id: string;
    method: string;
    totalAmount: number;
    cashEntered?: number | null;
    changeAmount?: number | null;
    paidAt: Date | string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // ─── Refresh Order ───
  const refreshOrder = useCallback(
    async (orderId: string) => {
      const order = await getOrderWithItems(orderId);
      if (order) {
        const tableStatus = tableStatuses.find((ts) => ts.tableId === (order.tableId || ""));
        setCurrentOrder({
          id: order.id,
          orderNumber: order.orderNumber,
          tableId: order.tableId,
          tableName: tableStatus?.tableName,
          orderType: order.orderType,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          serviceAmount: order.serviceAmount,
          discountAmount: order.discountAmount,
          totalAmount: order.totalAmount,
          items: order.items.map((item) => ({
            id: item.id,
            name: item.name,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            notes: item.notes,
            toppings: item.toppings.map((t) => ({
              id: t.toppingId,
              name: t.name,
              price: t.price,
            })),
          })),
          promos: order.promos?.map((op) => ({
            id: op.id,
            discountAmount: op.discountAmount,
            promo: {
              id: op.promo.id,
              name: op.promo.name,
              type: op.promo.type,
            },
          })),
          customer: order.customer,
        });
      }
    },
    [tableStatuses]
  );

  // ─── Table Selection ───
  const handleSelectTable = useCallback(
    (tableId: string | "takeaway") => {
      if (!sessionId) {
        alert("Buka shift terlebih dahulu");
        return;
      }
      setSelectedTableId(tableId);

      startTransition(async () => {
        const result = await getOrCreateDraftOrder({
          businessId,
          outletId,
          employeeId,
          sessionId,
          tableId: tableId === "takeaway" ? undefined : tableId,
          orderType: tableId === "takeaway" ? "TAKEAWAY" : "DINE_IN",
        });

        if (result.order) {
          const order = result.order as { id: string };
          setCurrentOrderId(order.id);
          await refreshOrder(order.id);
        } else if (result.error) {
          alert(result.error);
        }
      });
    },
    [sessionId, businessId, outletId, employeeId, refreshOrder]
  );

  // ─── Back to Table Selection (pos-kasir-f&b pattern) ───
  const handleBackToTables = () => {
    setSelectedTableId(null);
    setCurrentOrderId(null);
    setCurrentOrder(null);
  };

  // ─── Add Product ───
  const handleAddProduct = useCallback(
    (product: PosProduct, variantId?: string, toppingIds?: string[]) => {
      if (!currentOrderId) {
        alert("Pilih meja terlebih dahulu");
        return;
      }
      startTransition(async () => {
        const result = await addOrderItem(currentOrderId, {
          productId: product.id,
          variantId,
          toppingIds,
          quantity: 1,
        });
        if (result.ok) {
          await refreshOrder(currentOrderId);
        } else {
          alert(result.error || "Gagal menambahkan produk");
        }
      });
    },
    [currentOrderId, refreshOrder]
  );

  // ─── Update Qty ───
  const handleUpdateQty = useCallback(
    (orderItemId: string, qty: number) => {
      if (!currentOrderId) return;
      startTransition(async () => {
        const result = await updateOrderItemQty(orderItemId, qty);
        if (result.ok) {
          await refreshOrder(currentOrderId);
        } else {
          alert(result.error || "Gagal mengubah jumlah");
        }
      });
    },
    [currentOrderId, refreshOrder]
  );

  // ─── Remove Item ───
  const handleRemoveItem = useCallback(
    (orderItemId: string) => {
      if (!currentOrderId) return;
      startTransition(async () => {
        const result = await removeOrderItem(orderItemId);
        if (result.ok) {
          await refreshOrder(currentOrderId);
        }
      });
    },
    [currentOrderId, refreshOrder]
  );

  // ─── Pay ───
  const handlePay = () => {
    setShowPayModal(true);
  };

  // ─── Save Bill (Kirim Dapur / Simpan) ───
  const handleSaveBill = () => {
    // Return to table selection, order stays as draft
    setSelectedTableId(null);
    setCurrentOrderId(null);
    setCurrentOrder(null);
  };

  // ─── Shift Management ───
  const handleCloseShift = async () => {
    if (!sessionId) return;
    startTransition(async () => {
      const summary = await getShiftSummary(sessionId);
      setShiftSummary(summary);
      setShiftModalMode("close");
      setShowShiftModal(true);
    });
  };

  const handleShiftSuccess = (newSessionId?: string) => {
    if (shiftModalMode === "open" && newSessionId) {
      setSessionId(newSessionId);
      setSessionOpenedAt(new Date());
      setShowShiftModal(false);
      router.refresh();
    } else if (shiftModalMode === "close") {
      setShowShiftModal(false);
      router.push("/kasir/pin");
    }
  };

  // ─── Payment Success → Show Receipt ───
  const handlePaymentSuccess = async (paymentId: string) => {
    setShowPayModal(false);
    if (currentOrderId) {
      const order = await getOrderWithItems(currentOrderId);
      if (order?.payment) {
        setLastPayment({
          id: order.payment.id,
          method: order.payment.method,
          totalAmount: order.payment.totalAmount,
          cashEntered: order.payment.cashEntered,
          changeAmount: order.payment.changeAmount,
          paidAt: order.payment.paidAt,
        });
        setShowReceiptModal(true);
      }
    }
  };

  // ─── After Receipt → New Order (pos-kasir-f&b handleNewOrderReset) ───
  const handleReceiptClose = () => {
    setShowReceiptModal(false);
    setLastPayment(null);
    setCurrentOrder(null);
    setCurrentOrderId(null);
    setSelectedTableId(null);
    router.refresh();
  };

  // ─── Tab Switch ───
  const handleTabChange = (tab: "pos" | "history") => {
    setActiveTab(tab);
    if (tab === "history") {
      setSelectedTableId(null);
      setCurrentOrderId(null);
      setCurrentOrder(null);
    }
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* ─── Navbar ─── */}
      {sessionId && sessionOpenedAt && (
        <KasirNavbar
          kasirName={kasirName}
          outletName={outletName}
          sessionOpenedAt={sessionOpenedAt}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCloseShift={handleCloseShift}
        />
      )}

      {/* ─── Main Container ─── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {!sessionId ? (
          /* ═══ Lock Screen: Shift belum dibuka ═══ */
          <div className="h-full flex items-center justify-center p-6 bg-slate-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center max-w-md w-full space-y-5">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-800">Sesi Kasir Terkunci</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Silakan buka sesi kasir shift baru terlebih dahulu untuk memasukkan modal saldo awal kasir dan mulai melayani pesanan meja pelanggan.
                </p>
              </div>
              <button
                onClick={() => {
                  setShiftModalMode("open");
                  setShowShiftModal(true);
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                type="button"
              >
                Buka Shift Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : activeTab === "pos" ? (
          /* ═══ VIEW 1: Core POS — Grid 8:4 (pos-kasir-f&b layout) ═══ */
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Left col-span-8: TableSelection OR ProductCatalog */}
            <div className="col-span-8 p-5 overflow-hidden flex flex-col h-full border-r border-slate-200">
              {selectedTableId ? (
                <ProductCatalog
                  products={products}
                  categories={categories}
                  onAddProduct={handleAddProduct}
                  activeTableName={
                    selectedTableId === "takeaway"
                      ? "Takeaway"
                      : tables.find((t) => t.id === selectedTableId)?.name || selectedTableId
                  }
                  onBackToTables={handleBackToTables}
                />
              ) : (
                <TableSelection
                  tables={tables}
                  tableStatuses={tableStatuses}
                  selectedTableId={selectedTableId}
                  onSelectTable={handleSelectTable}
                />
              )}
            </div>

            {/* Right col-span-4: CartPanel (ALWAYS visible) */}
            <div className="col-span-4 h-full overflow-hidden">
              <CartPanel
                order={currentOrder}
                businessId={businessId}
                businessTaxRate={businessTaxRate}
                businessServiceRate={businessServiceRate}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onPay={handlePay}
                onSaveBill={handleSaveBill}
                onRefreshOrder={refreshOrder}
                loading={isPending}
              />
            </div>
          </div>
        ) : (
          /* ═══ VIEW 2: History / Laporan ═══ */
          <div className="flex-1 p-5 overflow-hidden">
            <LaporanPanel
              sessionId={sessionId ?? ""}
              kasirName={kasirName}
              outletName={outletName}
            />
          </div>
        )}
      </main>

      {/* ─── MODALS ─── */}
      {showShiftModal && (
        <ShiftModal
          mode={shiftModalMode}
          employeeId={employeeId}
          outletId={outletId}
          businessId={businessId}
          sessionId={shiftModalMode === "close" ? sessionId || undefined : undefined}
          summary={shiftModalMode === "close" ? shiftSummary || undefined : undefined}
          onSuccess={handleShiftSuccess}
          onCancel={shiftModalMode === "close" ? () => setShowShiftModal(false) : undefined}
        />
      )}

      {showPayModal && currentOrder && (
        <PaymentModal
          order={currentOrder}
          paymentMethods={paymentMethods}
          employeeId={employeeId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayModal(false)}
        />
      )}

      {showReceiptModal && currentOrder && lastPayment && (
        <ReceiptModal
          order={currentOrder}
          payment={lastPayment}
          businessName={businessName}
          businessAddress={businessAddress}
          businessPhone={businessPhone}
          kasirName={kasirName}
          receiptSettings={receiptSettings ?? undefined}
          onClose={handleReceiptClose}
        />
      )}
    </div>
  );
}
