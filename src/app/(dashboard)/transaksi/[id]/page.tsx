import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatDate, rupiah } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { TransactionActions } from "@/components/forms/transaction-actions";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      cashier: true,
      customer: true,
      payments: { include: { paymentMethod: true } },
      items: { include: { modifiers: true } },
      outlet: true,
    },
  });

  if (!transaction || transaction.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={transaction.transactionNumber}
        description="Snapshot produk, topping, pembayaran, dan outlet pada saat checkout disimpan agar histori transaksi tidak berubah walaupun data master diperbarui."
        breadcrumb="Operasional / Transaksi / Detail"
        actions={<TransactionActions transactionId={transaction.id} status={transaction.status} />}
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Status transaksi</p>
              <div className="mt-2">
                <Badge tone={transaction.status === "PAID" ? "success" : "warning"}>{transaction.status}</Badge>
              </div>
            </div>
            <p className="text-right text-sm text-slate-500">
              {transaction.cashier.name}
              <span className="mt-1 block font-semibold text-slate-900">{formatDate(transaction.createdAt)}</span>
            </p>
          </div>

          <div className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
            <div className="flex justify-between"><span>Outlet</span><span>{transaction.outlet.name}</span></div>
            <div className="flex justify-between"><span>Pelanggan</span><span>{transaction.customer?.name || "-"}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>{rupiah(decimalToNumber(transaction.subtotal))}</span></div>
            <div className="flex justify-between"><span>Pajak</span><span>{rupiah(decimalToNumber(transaction.taxTotal))}</span></div>
            <div className="flex justify-between"><span>Service charge</span><span>{rupiah(decimalToNumber(transaction.serviceChargeTotal))}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
              <span>Grand total</span>
              <span>{rupiah(decimalToNumber(transaction.grandTotal))}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Item transaksi</h2>
            <div className="mt-5 space-y-4">
              {transaction.items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex gap-4">
                    <Image
                      src={item.productImageSnapshot || "/images/products/product-placeholder.svg"}
                      alt={item.productNameSnapshot}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.productNameSnapshot}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.skuSnapshot || "-"}</p>
                        </div>
                        <p className="font-semibold text-bayaro-navy">{rupiah(decimalToNumber(item.subtotal))}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Qty {item.quantity} • Harga dasar {rupiah(decimalToNumber(item.basePrice))}</p>
                      {item.modifiers.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.modifiers.map((modifier) => (
                            <Badge key={modifier.id} tone="info">
                              {modifier.modifierNameSnapshot} +{rupiah(decimalToNumber(modifier.priceSnapshot))}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Pembayaran</h2>
            <div className="mt-4 space-y-3">
              {transaction.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{payment.paymentMethod.name}</p>
                    <p className="text-sm text-slate-500">{payment.referenceNumber || payment.status}</p>
                  </div>
                  <p className="font-semibold text-bayaro-navy">{rupiah(decimalToNumber(payment.amount))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
