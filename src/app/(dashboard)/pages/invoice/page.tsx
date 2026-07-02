import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

const invoice = {
  number: "INV-2024-07-0042",
  date: "15 Juli 2024",
  dueDate: "29 Juli 2024",
  status: "paid",
  from: {
    name: "Bayaro Coffee & Roastery",
    address: "Jl. Sudirman No. 88, Lantai 5",
    city: "Jakarta Selatan, DKI Jakarta 12190",
    email: "invoice@bayaro.id",
    phone: "+62 21 5555-8888",
  },
  to: {
    name: "PT Maju Bersama Nusantara",
    address: "Jl. Gatot Subroto Kav. 51",
    city: "Jakarta Pusat, DKI Jakarta 10260",
    email: "finance@majubersama.co.id",
    contact: "Ibu Ratna Dewi",
  },
  items: [
    { desc: "Paket Kafe Starter — Bayaro POS License", qty: 1, unit: "lisensi", price: 1500000, subtotal: 1500000 },
    { desc: "Kopi Susu Gula Aren (Box 10)", qty: 5, unit: "box", price: 280000, subtotal: 1400000 },
    { desc: "Matcha Latte Premium Mix", qty: 3, unit: "kg", price: 350000, subtotal: 1050000 },
    { desc: "Jasa Setup & Instalasi Sistem", qty: 1, unit: "paket", price: 750000, subtotal: 750000 },
  ],
  subtotal: 4700000,
  tax: 517000,
  discount: 200000,
  total: 5017000,
  notes: "Pembayaran dapat dilakukan melalui transfer bank BCA ke 123-456-7890 a.n. Bayaro Coffee & Roastery. Mohon cantumkan nomor invoice pada berita transfer.",
  bankInfo: { bank: "BCA", account: "123-456-7890", name: "Bayaro Coffee & Roastery" },
};

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function InvoicePage() {
  const statusTone =
    invoice.status === "paid" ? "success" : "warning";
  const statusLabel =
    invoice.status === "paid" ? "Lunas" : "Belum Dibayar";

  return (
    <div className="py-8 px-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-bayaro-navy text-white text-2xl font-bold flex items-center justify-center shrink-0">
              B
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900">Bayaro Admin Template</p>
              <p className="text-sm text-slate-500">Template invoice profesional</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-slate-500 font-medium">{invoice.number}</p>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
        </div>

        {/* From / To */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-[20px] bg-bayaro-soft p-5">
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Dari</p>
            <p className="font-bold text-slate-900">{invoice.from.name}</p>
            <p className="text-sm text-slate-600 mt-1">{invoice.from.address}</p>
            <p className="text-sm text-slate-600">{invoice.from.city}</p>
            <p className="text-sm text-slate-600 mt-2">{invoice.from.email}</p>
            <p className="text-sm text-slate-600">{invoice.from.phone}</p>
          </div>
          <div className="rounded-[20px] bg-slate-50 p-5">
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Kepada</p>
            <p className="font-bold text-slate-900">{invoice.to.name}</p>
            <p className="text-sm text-slate-600 mt-1">{invoice.to.address}</p>
            <p className="text-sm text-slate-600">{invoice.to.city}</p>
            <p className="text-sm text-slate-600 mt-2">{invoice.to.email}</p>
            <p className="text-sm text-slate-600">u.p. {invoice.to.contact}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-[16px] border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Tanggal Invoice</p>
            <p className="font-semibold text-slate-900 mt-1">{invoice.date}</p>
          </div>
          <div className="rounded-[16px] border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Jatuh Tempo</p>
            <p className="font-semibold text-slate-900 mt-1">{invoice.dueDate}</p>
          </div>
          <div className="rounded-[16px] border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Metode Pembayaran</p>
            <p className="font-semibold text-slate-900 mt-1">Transfer Bank</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bayaro-soft">
                <th className="rounded-tl-xl px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Deskripsi</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Satuan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Harga Satuan</th>
                <th className="rounded-tr-xl px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-3.5 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3.5 text-slate-900 font-medium">{item.desc}</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{item.qty}</td>
                  <td className="px-4 py-3.5 text-center text-slate-500">{item.unit}</td>
                  <td className="px-4 py-3.5 text-right text-slate-700">{rupiah(item.price)}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900">{rupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{rupiah(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Diskon</span>
              <span>- {rupiah(invoice.discount)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Pajak PPN 11%</span>
              <span>{rupiah(invoice.tax)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-bayaro-navy">{rupiah(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Bank Info */}
        <div className="bg-bayaro-soft rounded-[20px] p-5 mt-6 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Catatan</p>
            <p className="text-sm text-slate-700">{invoice.notes}</p>
          </div>
          <div className="border-t border-blue-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Informasi Bank</p>
            <div className="flex gap-6 text-sm text-slate-700">
              <div>
                <span className="text-slate-400">Bank</span>
                <p className="font-semibold">{invoice.bankInfo.bank}</p>
              </div>
              <div>
                <span className="text-slate-400">No. Rekening</span>
                <p className="font-semibold">{invoice.bankInfo.account}</p>
              </div>
              <div>
                <span className="text-slate-400">Atas Nama</span>
                <p className="font-semibold">{invoice.bankInfo.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <a href="#">
            <Button variant="secondary" className="gap-2">
              <Printer size={15} />
              Cetak
            </Button>
          </a>
          <a href="#">
            <Button variant="secondary" className="gap-2">
              <Download size={15} />
              Unduh PDF
            </Button>
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-8 pt-6 border-t border-slate-100">
          Terima kasih atas kepercayaan Anda.
        </p>
      </div>
    </div>
  );
}
