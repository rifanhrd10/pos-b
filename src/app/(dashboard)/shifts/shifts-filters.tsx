"use client"

import { DatePicker } from "@/components/ui/date-picker"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Employee {
  id: string
  name: string
}

interface Outlet {
  id: string
  name: string
}

interface ShiftsFiltersProps {
  employees: Employee[]
  outlets: Outlet[]
  defaultEmployee?: string
  defaultOutlet?: string
  defaultStart?: string
  defaultEnd?: string
}

export function ShiftsFilters({
  employees,
  outlets,
  defaultEmployee,
  defaultOutlet,
  defaultStart,
  defaultEnd,
}: ShiftsFiltersProps) {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState(defaultEmployee ?? "")
  const [outletId, setOutletId] = useState(defaultOutlet ?? "")
  const [start, setStart] = useState(defaultStart ?? "")
  const [end, setEnd] = useState(defaultEnd ?? "")

  function handleFilter() {
    const params = new URLSearchParams()
    if (employeeId) params.set("employee", employeeId)
    if (outletId) params.set("outlet", outletId)
    if (start) params.set("start", start)
    if (end) params.set("end", end)
    router.push(`/shifts?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >
        <option value="">Semua Kasir</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      <select
        value={outletId}
        onChange={(e) => setOutletId(e.target.value)}
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >
        <option value="">Semua Outlet</option>
        {outlets.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      <DatePicker
        value={start}
        onChange={setStart}
        placeholder="Tanggal mulai"
        className="w-48"
      />

      <DatePicker
        value={end}
        onChange={setEnd}
        placeholder="Tanggal akhir"
        className="w-48"
      />

      <button
        type="button"
        onClick={handleFilter}
        className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Filter
      </button>
      <Link
        href="/shifts"
        className="h-10 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:text-slate-700 flex items-center"
      >
        Reset
      </Link>
    </div>
  )
}
