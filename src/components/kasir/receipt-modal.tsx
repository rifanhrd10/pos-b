"use client";

import { X, Printer } from "lucide-react";

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
};

interface ReceiptModalProps {
  order: OrderWithItems;
  payment: {
    id: string;
    method: string;
    totalAmount: number;
    cashEntered?: number | null;
    changeAmount?: number | null;
    paidAt: Date | string;
  };
  businessName: string;
  businessAddress?: string | null;
  businessPhone?: string | null;
  kasirName: string;
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
  };
  onClose: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ReceiptModal({
  order,
  payment,
  businessName,
  businessAddress,
  businessPhone,
  kasirName,
  receiptSettings,
  onClose,
}: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const divider = "─".repeat(32);

  const header1 = receiptSettings?.header1 || businessName;
  const header2 = receiptSettings?.header2 || businessAddress;
  const header3 = receiptSettings?.header3 || businessPhone;
  const showKasir = receiptSettings?.showKasir !== false;
  const thankYouMessage =
    receiptSettings?.thankYou || "Terima kasih atas kunjungan Anda!";

  return (
    <>
      <style>{`
        @media print {
          body > *:not(.receipt-print-area) {
            display: none !important;
          }
          .receipt-print-area {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 w-full max-w-sm">
          {/* Buttons */}
          <div className="flex gap-2 mb-4 no-print">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
          </div>

          {/* Receipt */}
          <div className="receipt-print-area bg-white text-gray-900 p-4 font-mono text-xs leading-relaxed">
            {/* Header */}
            {header1 && (
              <div className="text-center font-bold text-sm">{header1}</div>
            )}
            {header2 && <div className="text-center text-xs">{header2}</div>}
            {header3 && <div className="text-center text-xs">{header3}</div>}
            <div className="text-center my-1">{divider}</div>

            {/* Order Info */}
            <div className="space-y-0.5">
              <div>No: {order.orderNumber}</div>
              <div>Tgl: {formatDateTime(payment.paidAt)}</div>
              {showKasir && <div>Kasir: {kasirName}</div>}
              <div>
                Meja:{" "}
                {order.tableName ||
                  (order.orderType === "TAKEAWAY" ? "Takeaway" : "-")}
              </div>
            </div>
            <div className="my-1">{divider}</div>

            {/* Items */}
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between">
                    <span>
                      {item.name} {item.quantity}x
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  {item.variantName && (
                    <div className="flex justify-between pl-2">
                      <span>Variant: {item.variantName}</span>
                      <span></span>
                    </div>
                  )}
                  {item.toppings.map((topping) => (
                    <div key={topping.id} className="flex justify-between pl-2">
                      <span>+ {topping.name}</span>
                      <span>{formatCurrency(topping.price)}</span>
                    </div>
                  ))}
                  {item.notes && (
                    <div className="pl-2 text-gray-600">Note: {item.notes}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="my-1">{divider}</div>

            {/* Totals */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {/* Promo/Diskon Section */}
              {order.promos && order.promos.length > 0 && (
                <>
                  <div className="my-1">{divider}</div>
                  <div className="font-semibold">Promo/Diskon:</div>
                  {order.promos.map((orderPromo) => (
                    <div key={orderPromo.id} className="flex justify-between pl-2">
                      <span>
                        - {orderPromo.promo.name}{" "}
                        <span className="text-[9px] text-gray-600">
                          ({orderPromo.promo.type === "VOUCHER" ? "Voucher" : 
                            orderPromo.promo.type === "BUNDLE" ? "Bundle" : "Happy Hour"})
                        </span>
                      </span>
                      <span>-{formatCurrency(orderPromo.discountAmount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold">
                    <span>Total Diskon:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                  <div className="my-1">{divider}</div>
                </>
              )}

              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({((order.taxAmount / order.subtotal) * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
              )}
              {order.serviceAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service ({((order.serviceAmount / order.subtotal) * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(order.serviceAmount)}</span>
                </div>
              )}
            </div>
            <div className="my-1">{divider}</div>

            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="my-1">{divider}</div>

            {/* Payment Details */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>{payment.method === "CASH" ? "Tunai" : payment.method}</span>
                <span>
                  {payment.method === "CASH" && payment.cashEntered
                    ? formatCurrency(payment.cashEntered)
                    : formatCurrency(payment.totalAmount)}
                </span>
              </div>
              {payment.method === "CASH" && payment.changeAmount !== null && payment.changeAmount !== undefined && (
                <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>{formatCurrency(payment.changeAmount)}</span>
                </div>
              )}
            </div>
            <div className="my-1">{divider}</div>

            {/* Footer */}
            <div className="text-center mt-2">
              <div>{thankYouMessage}</div>
              {receiptSettings?.footer && (
                <div className="mt-1">{receiptSettings.footer}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
