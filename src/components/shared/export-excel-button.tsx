"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportExcelButtonProps {
  data: Array<Record<string, any>>
  filename: string
  columns: Array<{ key: string; label: string }>
}

export function ExportExcelButton({ data, filename, columns }: ExportExcelButtonProps) {
  const handleExport = async () => {
    const XLSX = await import("xlsx")
    
    const exportData = data.map((row) => {
      const obj: Record<string, any> = {}
      columns.forEach((col) => {
        obj[col.label] = row[col.key]
      })
      return obj
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Data")
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export Excel
    </Button>
  )
}
