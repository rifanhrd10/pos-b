"use client";

import { useState } from "react";
import { X, Printer, Usb, Bluetooth, CheckCircle2, RefreshCw } from "lucide-react";
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
    dateStyle: "medium",
    timeStyle: "short",
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [usbToast, setUsbToast] = useState<string | null>(null);
  const [btToast, setBtToast] = useState<string | null>(null);
  const [showBtConfirm, setShowBtConfirm] = useState(false);

  const charWidth = paperWidth === 58 ? 32 : 48;
  const divider = "─".repeat(charWidth);

  const header1 = receiptSettings?.header1 || businessName;
  const header2 = receiptSettings?.header2 ?? businessAddress;
  const header3 = receiptSettings?.header3 ?? businessPhone;
  const showKasir = receiptSettings?.showKasir !== false;
  const thankYouMessage = receiptSettings?.thankYou || "Terima kasih atas kunjungan Anda!";

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setPrinted(true);
      if (onPrint) onPrint();
      window.print();
    }, 800);
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

  const handleBtPrint = () => {
    setShowBtConfirm(true);
  };

  const confirmBtPrint = async () => {
    setShowBtConfirm(false);
    
    // Check browser support
    if (!WebBluetoothPrinter.isSupported()) {
      setBtToast("Browser Anda tidak mendukung Web Bluetooth (gunakan Chrome)");
      setTimeout(() => setBtToast(null), 3000);
      return;
    }

    const printer = new WebBluetoothPrinter();
    
    // Request device (triggers device picker)
    const deviceSelected = await printer.requestDevice();
    if (!deviceSelected) {
      setBtToast("Tidak ada printer yang dipilih");
      setTimeout(() => setBtToast(null), 3000);
      return;
    }

    // Connect to selected device
    const connected = await printer.connect();
    if (!connected) {
      setBtToast("Gagal terhubung ke printer Bluetooth");
      setTimeout(() => setBtToast(null), 3000);
      return;
    }

    // Print
    const data = buildReceipt(buildReceiptData(), paperWidth);
    const ok = await printer.print(data);
    if (!ok) {
      setBtToast("Gagal mencetak via Bluetooth");
      setTimeout(() => setBtToast(null), 3000);
    } else {
      setBtToast("Berhasil mencetak!");
      setTimeout(() => setBtToast(null), 2000);
    }

    // Wait a bit more before disconnect to ensure printer finishes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Disconnect after print
    await printer.disconnect();
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
        <div style={{ fontFamily: "monospace", fontSize: "12px", width: paperWidth === 58 ? "58mm" : "80mm", padding: "4px" }}>
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
            <div>{padRow("Pajak:", `+${formatCurrency(order.taxAmount)}`, charWidth)}</div>
          )}
          {order.serviceAmount > 0 && (
            <div>{padRow("Service:", `+${formatCurrency(order.serviceAmount)}`, charWidth)}</div>
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
      <div className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center flex flex-col items-center flex-shrink-0">
            <CheckCircle2 className="w-12 h-12 text-white mb-2" />
            <h3 className="text-lg font-bold tracking-tight">Pembayaran Sukses!</h3>
            <p className="text-xs text-blue-100 mt-1">
              Transaksi berhasil diproses.
            </p>
          </div>

          {/* Thermal Receipt Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-inner max-w-sm mx-auto font-mono text-[11px] text-slate-800 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              {/* Header */}
              <div className="text-center space-y-0.5">
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">{header1}</h4>
                {header2 && <p className="text-[10px] text-slate-400">{header2}</p>}
                {header3 && <p className="text-[9px] text-slate-400">{header3}</p>}
              </div>

              <div className="border-t border-dashed border-slate-300"></div>

              {/* Meta */}
              <div className="space-y-0.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Order:</span>
                  <span className="text-slate-800 font-semibold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span className="text-slate-800">{formatDateTime(payment.paidAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipe:</span>
                  <span className="text-slate-800 font-semibold uppercase">
                    {order.orderType === "DINE_IN" ? "Dine In" : "Takeaway"}
                    {order.tableName ? ` | ${order.tableName}` : ""}
                  </span>
                </div>
                {showKasir && (
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span className="text-slate-800">{kasirName}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-slate-300"></div>

              {/* Items */}
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span className="line-clamp-1">
                        {item.name}
                        {item.variantName ? ` (${item.variantName})` : ""}
                      </span>
                      <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>{item.quantity} x {formatCurrency(item.price)}</span>
                      {item.notes && <span className="italic text-amber-700">({item.notes})</span>}
                    </div>
                    {item.toppings.map((t) => (
                      <div key={t.id} className="flex justify-between text-slate-400 text-[10px]">
                        <span>+ {t.name}</span>
                        <span>{formatCurrency(t.price)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300"></div>

              {/* Totals */}
              <div className="space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak{order.taxRate ? ` (${order.taxRate}%)` : ""}:</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
                {order.serviceAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Service{order.serviceRate ? ` (${order.serviceRate}%)` : ""}:</span>
                    <span>{formatCurrency(order.serviceAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-950 font-black border-t border-dotted border-slate-300 pt-1.5 text-xs">
                  <span>TOTAL AKHIR:</span>
                  <span className="text-emerald-700">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300"></div>

              {/* Payment */}
              <div className="space-y-0.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Tipe Bayar:</span>
                  <span className="text-slate-800 font-bold">
                    {payment.method === "CASH" ? "Tunai" : payment.method}
                  </span>
                </div>
                {payment.method === "CASH" && payment.cashEntered != null && (
                  <>
                    <div className="flex justify-between">
                      <span>Uang Masuk:</span>
                      <span className="text-slate-800">{formatCurrency(payment.cashEntered)}</span>
                    </div>
                    {payment.changeAmount != null && (
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Kembalian:</span>
                        <span>{formatCurrency(payment.changeAmount)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-slate-300"></div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-400 space-y-0.5">
                <p className="font-semibold">{thankYouMessage}</p>
                {receiptSettings?.footer && <p className="text-[9px]">{receiptSettings.footer}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 flex-shrink-0">
            {/* Paper width toggle */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[10px] text-slate-400 font-medium">Lebar kertas:</span>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                <button
                  onClick={() => setPaperWidth(58)}
                  className={`px-2.5 py-1 font-medium transition-colors ${
                    paperWidth === 58 ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                  type="button"
                >
                  58mm
                </button>
                <button
                  onClick={() => setPaperWidth(80)}
                  className={`px-2.5 py-1 font-medium transition-colors ${
                    paperWidth === 80 ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                  type="button"
                >
                  80mm
                </button>
              </div>
            </div>

            {usbToast && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{usbToast}</div>
            )}
            {btToast && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{btToast}</div>
            )}

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                printed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white hover:bg-slate-50 border-slate-250 text-slate-700 active:scale-95"
              }`}
              type="button"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? "Mencetak..." : printed ? "Struk Berhasil Dicetak!" : "Cetak Struk (Browser)"}
            </button>

            {WebSerialPrinter.isSupported() && (
              <button
                onClick={handleUsbPrint}
                className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                type="button"
              >
                <Usb className="w-3.5 h-3.5" /> Print via USB
              </button>
            )}

            {WebBluetoothPrinter.isSupported() && (
              <button
                onClick={handleBtPrint}
                className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                type="button"
              >
                <Bluetooth className="w-3.5 h-3.5" /> Print via Bluetooth
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Buat Transaksi Baru
            </button>
          </div>
        </div>
      </div>

      {/* Bluetooth Confirmation Modal */}
      {showBtConfirm && (
        <div className="no-print fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Bluetooth className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Print via Bluetooth?
                </h3>
                <p className="text-sm text-slate-600">
                  Sistem akan scan dan menampilkan daftar printer Bluetooth yang tersedia.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Pastikan printer sudah <span className="font-semibold">ON</span> dan <span className="font-semibold">dalam jangkauan</span>.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setShowBtConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
                  type="button"
                >
                  Batal
                </button>
                <button
                  onClick={confirmBtPrint}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-200"
                  type="button"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
