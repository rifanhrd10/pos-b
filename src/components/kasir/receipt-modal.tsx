"use client";

import { useState } from "react";
import { X, Printer, Usb, Bluetooth } from "lucide-react";
import { WebSerialPrinter } from "@/lib/printer/web-serial";
import { WebBluetoothPrinter } from "@/lib/printer/web-bluetooth";
import { buildReceipt, type ReceiptData, type PaperWidth } from "@/lib/printer/receipt-builder";

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
  taxRate?: number;
  serviceRate?: number;
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
  paperWidth?: PaperWidth;
  onPrint?: () => void;
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

function padRow(left: string, right: string, width: number): string {
  const space = width - left.length - right.length;
  return left + " ".repeat(Math.max(1, space)) + right;
}

export function ReceiptModal({
  order,
  payment,
  businessName,
  businessAddress,
  businessPhone,
  kasirName,
  receiptSettings,
  paperWidth: paperWidthProp = 58,
  onPrint,
  onClose,
}: ReceiptModalProps) {
  const [paperWidth, setPaperWidth] = useState<PaperWidth>(paperWidthProp);
  const [usbToast, setUsbToast] = useState<string | null>(null);
  const [btToast, setBtToast] = useState<string | null>(null);

  const charWidth = paperWidth === 58 ? 32 : 48;
  const divider = "─".repeat(charWidth);

  const header1 = receiptSettings?.header1 || businessName;
  const header2 = receiptSettings?.header2 ?? businessAddress;
  const header3 = receiptSettings?.header3 ?? businessPhone;
  const showKasir = receiptSettings?.showKasir !== false;
  const thankYouMessage =
    receiptSettings?.thankYou || "Terima kasih atas kunjungan Anda!";

  const handlePrint = () => {
    if (onPrint) onPrint();
    window.print();
  };

  const buildReceiptData = (): ReceiptData => ({
    businessName,
    address: businessAddress ?? undefined,
    phone: businessPhone ?? undefined,
    header1: receiptSettings?.header1 ?? undefined,
    header2: receiptSettings?.header2 ?? undefined,
    header3: receiptSettings?.header3 ?? undefined,
    thankYou: receiptSettings?.thankYou ?? undefined,
    orderNumber: order.orderNumber,
    createdAt: new Date(payment.paidAt),
    cashierName: kasirName,
    orderType: order.orderType,
    tableName: order.tableName,
    items: order.items.map((item) => ({
      name: item.name,
      variantName: item.variantName ?? undefined,
      toppings: item.toppings.map((t) => t.name),
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      notes: item.notes ?? undefined,
    })),
    promos: order.promos?.map((p) => ({
      name: p.promo.name,
      discountAmount: p.discountAmount,
    })),
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    serviceAmount: order.serviceAmount,
    totalAmount: order.totalAmount,
    taxRate: order.taxRate ?? 0,
    serviceRate: order.serviceRate ?? 0,
    paymentMethod: payment.method,
    cashEntered: payment.cashEntered ?? undefined,
    changeAmount: payment.changeAmount ?? undefined,
  });

  const handleUsbPrint = async () => {
    const printer = new WebSerialPrinter();
    if (!WebSerialPrinter.isSupported()) {
      setUsbToast("Browser Anda tidak mendukung Web Serial (gunakan Chrome)");
      setTimeout(() => setUsbToast(null), 3000);
      return;
    }
    if (!printer.isConnected()) {
      setUsbToast("Printer USB belum tersambung. Sambungkan dulu di Pengaturan Printer.");
      setTimeout(() => setUsbToast(null), 3000);
      return;
    }
    const data = buildReceipt(buildReceiptData(), paperWidth);
    const ok = await printer.printAndCut(data);
    if (!ok) {
      setUsbToast("Gagal mencetak via USB");
      setTimeout(() => setUsbToast(null), 3000);
    }
  };

  const handleBtPrint = async () => {
    const printer = new WebBluetoothPrinter();
    if (!WebBluetoothPrinter.isSupported()) {
      setBtToast("Browser Anda tidak mendukung Web Bluetooth (gunakan Chrome)");
      setTimeout(() => setBtToast(null), 3000);
      return;
    }
    if (!printer.isConnected()) {
      setBtToast("Printer Bluetooth belum tersambung. Sambungkan dulu di Pengaturan Printer.");
      setTimeout(() => setBtToast(null), 3000);
      return;
    }
    const data = buildReceipt(buildReceiptData(), paperWidth);
    const ok = await printer.print(data);
    if (!ok) {
      setBtToast("Gagal mencetak via Bluetooth");
      setTimeout(() => setBtToast(null), 3000);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          .receipt-print-area { display: block !important; }
          .no-print { display: none !important; }
        }
        .receipt-print-area { display: none; }
      `}</style>

      {/* Print-only area */}
      <div className="receipt-print-area">
        <div className={`receipt-paper ${paperWidth === 58 ? "w-58mm" : "w-80mm"}`}>
          <div style={{ textAlign: "center", fontWeight: "bold" }}>{header1}</div>
          {header2 && <div style={{ textAlign: "center" }}>{header2}</div>}
          {header3 && <div style={{ textAlign: "center" }}>{header3}</div>}
          <div>{divider}</div>
          <div>No: {order.orderNumber}</div>
          <div>Tgl: {formatDateTime(payment.paidAt)}</div>
          {showKasir && <div>Kasir: {kasirName}</div>}
          <div>
            Tipe: {order.orderType === "DINE_IN" ? "Dine In" : "Takeaway"}
            {order.tableName ? ` | Meja: ${order.tableName}` : ""}
          </div>
          <div>{divider}</div>
          {order.items.map((item) => (
            <div key={item.id}>
              <div>{item.name}{item.variantName ? ` (${item.variantName})` : ""}</div>
              <div>{padRow(`  ${item.quantity} x ${formatCurrency(item.price)}`, formatCurrency(item.subtotal), charWidth)}</div>
              {item.toppings.map((t) => (
                <div key={t.id}>{padRow(`  + ${t.name}`, formatCurrency(t.price), charWidth)}</div>
              ))}
              {item.notes && <div>  * {item.notes}</div>}
            </div>
          ))}
          <div>{divider}</div>
          <div>{padRow("Subtotal:", formatCurrency(order.subtotal), charWidth)}</div>
          {order.discountAmount > 0 && (
            <div>{padRow("Diskon:", `-${formatCurrency(order.discountAmount)}`, charWidth)}</div>
          )}
          {order.taxAmount > 0 && (
            <div>{padRow(`PPN (${order.taxRate ?? ""}%):`, `+${formatCurrency(order.taxAmount)}`, charWidth)}</div>
          )}
          {order.serviceAmount > 0 && (
            <div>{padRow(`Service (${order.serviceRate ?? ""}%):`, `+${formatCurrency(order.serviceAmount)}`, charWidth)}</div>
          )}
          <div>{divider}</div>
          <div style={{ fontWeight: "bold" }}>{padRow("TOTAL:", formatCurrency(order.totalAmount), charWidth)}</div>
          <div>{divider}</div>
          <div>
            {padRow(
              `Bayar (${payment.method === "CASH" ? "Cash" : payment.method}):`,
              payment.method === "CASH" && payment.cashEntered
                ? formatCurrency(payment.cashEntered)
                : formatCurrency(payment.totalAmount),
              charWidth
            )}
          </div>
          {payment.method === "CASH" && payment.changeAmount != null && (
            <div>{padRow("Kembali:", formatCurrency(payment.changeAmount), charWidth)}</div>
          )}
          <div>{divider}</div>
          <div style={{ textAlign: "center" }}>{thankYouMessage}</div>
          {receiptSettings?.footer && (
            <div style={{ textAlign: "center" }}>{receiptSettings.footer}</div>
          )}
        </div>
      </div>

      {/* Modal UI */}
      <div className="no-print fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Struk Pembayaran</h2>
            <div className="flex items-center gap-2">
              {/* Paper width toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                <button
                  onClick={() => setPaperWidth(58)}
                  className={`px-2 py-1 font-medium transition-colors ${
                    paperWidth === 58
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  58mm
                </button>
                <button
                  onClick={() => setPaperWidth(80)}
                  className={`px-2 py-1 font-medium transition-colors ${
                    paperWidth === 80
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  80mm
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Receipt preview */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            <div
              className={`receipt-paper mx-auto bg-white shadow-sm p-3 ${
                paperWidth === 58 ? "w-58mm" : "w-80mm"
              }`}
            >
              {/* Header */}
              <div className="text-center font-bold">{header1}</div>
              {header2 && <div className="text-center">{header2}</div>}
              {header3 && <div className="text-center">{header3}</div>}
              <div className="my-1">{divider}</div>

              {/* Order info */}
              <div>No: {order.orderNumber}</div>
              <div>Tgl: {formatDateTime(payment.paidAt)}</div>
              {showKasir && <div>Kasir: {kasirName}</div>}
              <div>
                Tipe: {order.orderType === "DINE_IN" ? "Dine In" : "Takeaway"}
                {order.tableName ? ` | Meja: ${order.tableName}` : ""}
              </div>
              <div className="my-1">{divider}</div>

              {/* Items */}
              {order.items.map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="font-medium">
                    {item.name}
                    {item.variantName ? ` (${item.variantName})` : ""}
                  </div>
                  <div className="flex justify-between">
                    <span>
                      &nbsp;&nbsp;{item.quantity} x {formatCurrency(item.price)}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  {item.toppings.map((t) => (
                    <div key={t.id} className="flex justify-between">
                      <span>&nbsp;&nbsp;+ {t.name}</span>
                      <span>{formatCurrency(t.price)}</span>
                    </div>
                  ))}
                  {item.notes && (
                    <div className="text-slate-500">&nbsp;&nbsp;* {item.notes}</div>
                  )}
                </div>
              ))}
              <div className="my-1">{divider}</div>

              {/* Totals */}
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>
                      Diskon
                      {order.promos && order.promos.length > 0
                        ? ` (${order.promos.map((p) => p.promo.name).join(", ")})`
                        : ""}
                    </span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>PPN{order.taxRate ? ` (${order.taxRate}%)` : ""}</span>
                    <span>+{formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
                {order.serviceAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Service{order.serviceRate ? ` (${order.serviceRate}%)` : ""}</span>
                    <span>+{formatCurrency(order.serviceAmount)}</span>
                  </div>
                )}
              </div>
              <div className="my-1">{divider}</div>

              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="my-1">{divider}</div>

              {/* Payment */}
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span>{payment.method === "CASH" ? "Tunai" : payment.method}</span>
                  <span>
                    {payment.method === "CASH" && payment.cashEntered
                      ? formatCurrency(payment.cashEntered)
                      : formatCurrency(payment.totalAmount)}
                  </span>
                </div>
                {payment.method === "CASH" &&
                  payment.changeAmount != null && (
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

          {/* Action buttons */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            {/* Toast notifications */}
            {usbToast && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                {usbToast}
              </div>
            )}
            {btToast && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                {btToast}
              </div>
            )}

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print (Browser)
            </button>

            {WebSerialPrinter.isSupported() && (
              <button
                onClick={handleUsbPrint}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Usb className="h-4 w-4" />
                Print via USB
              </button>
            )}

            {WebBluetoothPrinter.isSupported() && (
              <button
                onClick={handleBtPrint}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Bluetooth className="h-4 w-4" />
                Print via Bluetooth
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
