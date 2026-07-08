"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KasirNavbar } from "@/components/kasir/kasir-navbar";
import { ShiftModal } from "@/components/kasir/shift-modal";
import { TableSelection } from "@/components/kasir/table-selection";
import { ProductCatalog } from "@/components/kasir/product-catalog";
import { CartPanel } from "@/components/kasir/cart-panel";
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
};

interface PosClientProps {
  kasirName: string;
  outletName: string;
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
}

export function PosClient({
  kasirName,
  outletName,
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
}: PosClientProps) {
  const router = useRouter();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderWithItems | null>(null);
  const [activeTab, setActiveTab] = useState<"pos" | "laporan">("pos");
  const [showShiftModal, setShowShiftModal] = useState(!activeSession);
  const [shiftModalMode, setShiftModalMode] = useState<"open" | "close">("open");
  const [sessionId, setSessionId] = useState<string | null>(activeSession?.id || null);
  const [sessionOpenedAt, setSessionOpenedAt] = useState<Date | null>(
    activeSession?.openedAt || null
  );
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshOrder = useCallback(
    async (orderId: string) => {
      const order = await getOrderWithItems(orderId);
      if (order) {
        const tableStatus = tableStatuses.find((ts) => ts.tableId === order.tableId || "");
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
        });
      }
    },
    [tableStatuses]
  );

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
          const order = result.order as {
            id: string;
            orderNumber: string;
            tableId: string | null;
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
              toppings: Array<{ toppingId: string; name: string; price: number }>;
            }>;
          };

          setCurrentOrderId(order.id);
          await refreshOrder(order.id);
        } else if (result.error) {
          alert(result.error);
        }
      });
    },
    [sessionId, businessId, outletId, employeeId, refreshOrder]
  );

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

  const handlePay = () => {
    setShowPayModal(true);
  };

  const handleSaveBill = () => {
    alert("Fitur simpan bill akan diimplementasikan di Block E");
  };

  const handleLaporan = () => {
    setActiveTab("laporan");
  };

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

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {sessionId && sessionOpenedAt && (
        <KasirNavbar
          kasirName={kasirName}
          outletName={outletName}
          sessionOpenedAt={sessionOpenedAt}
          onLaporan={handleLaporan}
          onCloseShift={handleCloseShift}
          activeTab={activeTab}
        />
      )}

      {activeTab === "pos" ? (
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Left panel 38% */}
          <div className="w-[38%] border-r border-slate-700 p-4 overflow-y-auto">
            <TableSelection
              tables={tables}
              tableStatuses={tableStatuses}
              selectedTableId={selectedTableId}
              onSelectTable={handleSelectTable}
            />
          </div>

          {/* Right panel 62% */}
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            {/* Product catalog top 60% */}
            <div className="flex-1 overflow-hidden">
              <ProductCatalog
                products={products}
                categories={categories}
                onAddProduct={handleAddProduct}
              />
            </div>

            {/* Cart panel bottom 40% */}
            <div className="h-[45%]">
              <CartPanel
                order={currentOrder}
                businessTaxRate={businessTaxRate}
                businessServiceRate={businessServiceRate}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onPay={handlePay}
                onSaveBill={handleSaveBill}
                loading={isPending}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-xl font-medium">Laporan Panel</p>
            <p className="text-sm mt-2">(coming soon in Block E)</p>
          </div>
        </div>
      )}

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

      {showPayModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
            <p className="text-slate-300 text-center">
              Payment Modal akan diimplementasikan di Block F
            </p>
            <button
              onClick={() => setShowPayModal(false)}
              className="mt-4 w-full py-3 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
