"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { PrinterManager } from "@/components/kasir/printer-manager";
import { ReceiptModal } from "@/components/kasir/receipt-modal";
import { updateGeneralSettings } from "@/actions/settings";
import type { PaperWidth } from "@/lib/printer/receipt-builder";

interface PrinterSettingsClientProps {
  autoPrintReceipt: boolean;
  businessName: string;
  businessAddress: string | null;
  businessPhone: string | null;
}

// Dummy receipt data for preview
const DUMMY_ORDER = {
  id: "preview",
  orderNumber: "TRX-20260703-001",
  tableId: null,
  tableName: "5",
  orderType: "DINE_IN",
  subtotal: 91000,
  taxAmount: 9100,
  serviceAmount: 4550,
  discountAmount: 9100,
  totalAmount: 95550,
  taxRate: 10,
  serviceRate: 5,
  items: [
    {
      id: "1",
      name: "Kopi Susu",
      variantName: "Large",
      price: 25000,
      quantity: 2,
      subtotal: 50000,
      notes: null,
      toppings: [{ id: "t1", name: "Extra Shot", price: 5000 }],
    },
    {
      id: "2",
      name: "Croissant",
      variantName: null,
      price: 18000,
      quantity: 2,
      subtotal: 36000,
      notes: null,
      toppings: [],
    },
  ],
  promos: [{ id: "p1", discountAmount: 9100, promo: { id: "pr1", name: "DISC10", type: "PERCENTAGE" } }],
};

const DUMMY_PAYMENT = {
  id: "pay-preview",
  method: "CASH",
  totalAmount: 95550,
  cashEntered: 100000,
  changeAmount: 4450,
  paidAt: new Date("2026-07-03T14:30:00"),
};

export function PrinterSettingsClient({
  autoPrintReceipt,
  businessName,
  businessAddress,
  businessPhone,
}: PrinterSettingsClientProps) {
  const [autoPrint, setAutoPrint] = useState(autoPrintReceipt);
  const [paperWidth, setPaperWidth] = useState<PaperWidth>(58);
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAutoPrintChange = (checked: boolean) => {
    setAutoPrint(checked);
    startTransition(async () => {
      await updateGeneralSettings({ autoPrintReceipt: checked } as Parameters<typeof updateGeneralSettings>[0]);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left column: Printer connection + Auto print */}
      <div className="space-y-4">
        <PrinterManager
          paperWidth={paperWidth}
          onPaperWidthChange={setPaperWidth}
        />

        {/* Auto Print Toggle */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="mb-1 font-semibold text-slate-800">Auto Print</h3>
          <p className="mb-3 text-xs text-slate-500">
            Cetak struk otomatis setelah transaksi selesai
          </p>
          <Switch
            checked={autoPrint}
            onChange={handleAutoPrintChange}
            label={autoPrint ? "Aktif" : "Nonaktif"}
          />
          {isPending && (
            <p className="mt-2 text-xs text-slate-400">Menyimpan...</p>
          )}
        </div>
      </div>

      {/* Right column: Receipt preview */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="mb-3 font-semibold text-slate-800">Preview Struk</h3>
          <p className="mb-4 text-xs text-slate-500">
            Tampilan struk dengan data contoh menggunakan lebar kertas yang dipilih.
          </p>
          <button
            onClick={() => setShowPreview(true)}
            className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-500 hover:border-bayaro-blue hover:text-bayaro-blue transition-colors"
          >
            Klik untuk preview struk {paperWidth}mm
          </button>
        </div>
      </div>

      {/* Receipt preview modal */}
      {showPreview && (
        <ReceiptModal
          order={DUMMY_ORDER}
          payment={DUMMY_PAYMENT}
          businessName={businessName}
          businessAddress={businessAddress}
          businessPhone={businessPhone}
          kasirName="Budi"
          paperWidth={paperWidth}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
