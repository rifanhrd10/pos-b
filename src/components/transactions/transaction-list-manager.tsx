"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, rupiah } from "@/lib/utils";

type TransactionItem = {
  id: string;
  transactionNumber: string;
  cashierName: string;
  createdAt: string;
  grandTotal: number;
  status: string;
  itemCount: number;
};

export function TransactionListManager({ transactions }: { transactions: TransactionItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [cashier, setCashier] = useState("all");

  const cashiers = useMemo(
    () => ["all", ...Array.from(new Set(transactions.map((item) => item.cashierName)))],
    [transactions],
  );

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchQuery =
          !query ||
          transaction.transactionNumber.toLowerCase().includes(query.toLowerCase()) ||
          transaction.cashierName.toLowerCase().includes(query.toLowerCase());
        const matchStatus = status === "all" || transaction.status === status;
        const matchCashier = cashier === "all" || transaction.cashierName === cashier;
        return matchQuery && matchStatus && matchCashier;
      }),
    [transactions, query, status, cashier],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[28px] bg-white p-5 shadow-soft md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <Input placeholder="Cari nomor transaksi atau kasir..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
          <option value="all">Semua status</option>
          <option value="PAID">PAID</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select value={cashier} onChange={(event) => setCashier(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-bayaro-blue">
          {cashiers.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Semua kasir" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-500 md:grid">
          <div>No. transaksi</div>
          <div>Kasir</div>
          <div>Tanggal</div>
          <div>Total</div>
          <div>Status</div>
        </div>
        {filtered.map((transaction) => (
          <Link key={transaction.id} href={`/transaksi/${transaction.id}`} className="grid gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] md:items-center">
            <div>
              <p className="font-semibold text-slate-900">{transaction.transactionNumber}</p>
              <p className="mt-1 text-sm text-slate-500">{transaction.itemCount} item</p>
            </div>
            <div className="text-sm text-slate-700">{transaction.cashierName}</div>
            <div className="text-sm text-slate-700">{formatDate(transaction.createdAt)}</div>
            <div className="text-sm font-semibold text-bayaro-navy">{rupiah(transaction.grandTotal)}</div>
            <div><Badge tone={transaction.status === "PAID" ? "success" : "warning"}>{transaction.status}</Badge></div>
          </Link>
        ))}
        {!filtered.length ? <div className="p-6 text-sm text-slate-500">Tidak ada transaksi yang cocok.</div> : null}
      </div>
    </div>
  );
}
