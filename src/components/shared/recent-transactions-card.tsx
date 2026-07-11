"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatRp, timeAgo } from "@/lib/format"
import { ArrowRight } from "lucide-react"

interface Transaction {
  id: string
  orderNumber: string
  outletName: string
  employeeName: string
  method: string
  totalAmount: number
  createdAt: Date
}

interface RecentTransactionsCardProps {
  initialTransactions: Transaction[]
  businessId: string
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer",
  DEBIT_CARD: "Debit",
  CREDIT_CARD: "Kredit",
}

export function RecentTransactionsCard({
  initialTransactions,
  businessId,
}: RecentTransactionsCardProps) {
  const [transactions, setTransactions] = useState(initialTransactions)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/dashboard/recent-transactions?businessId=${businessId}`)
        if (response.ok) {
          const data = await response.json()
          setTransactions(data)
        }
      } catch (error) {
        console.error("Failed to fetch recent transactions:", error)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [businessId])

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
        <Link
          href="/reports/sales"
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Belum ada transaksi</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {transaction.orderNumber}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {transaction.outletName} • {transaction.employeeName}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                <span className="text-sm font-semibold text-gray-900">
                  {formatRp(transaction.totalAmount)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge tone="success">
                    {METHOD_LABELS[transaction.method] || transaction.method}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {timeAgo(new Date(transaction.createdAt))}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
