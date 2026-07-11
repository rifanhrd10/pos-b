import { EscPosEncoder } from './esc-pos'

export interface ReceiptData {
  // Business/outlet
  businessName: string
  outletName?: string
  address?: string
  phone?: string
  // Header lines from settings
  header1?: string
  header2?: string
  header3?: string
  thankYou?: string
  // Order info
  orderNumber: string
  createdAt: Date
  cashierName: string
  orderType: string // 'DINE_IN' | 'TAKEAWAY'
  tableName?: string
  // Items
  items: Array<{
    name: string
    variantName?: string
    toppings?: string[]
    quantity: number
    price: number
    subtotal: number
    notes?: string
  }>
  // Promos
  promos?: Array<{
    name: string
    discountAmount: number
  }>
  // Totals
  subtotal: number
  discountAmount: number
  taxAmount: number
  serviceAmount: number
  totalAmount: number
  taxRate: number
  serviceRate: number
  // Payment
  paymentMethod: string
  cashEntered?: number
  changeAmount?: number
}

export interface KotData {
  orderNumber: string
  tableName?: string
  orderType: string
  cashierName: string
  createdAt: Date
  items: Array<{
    name: string
    variantName?: string
    toppings?: string[]
    quantity: number
    notes?: string
  }>
}

export type PaperWidth = 58 | 80

// Column widths in characters
const CHAR_WIDTH: Record<PaperWidth, number> = {
  58: 32,
  80: 48,
}

function formatRp(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID')
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export function buildReceipt(data: ReceiptData, paperWidth: PaperWidth = 58): Uint8Array {
  const w = CHAR_WIDTH[paperWidth]
  const enc = new EscPosEncoder()

  enc.initialize()

  // --- Header ---
  enc.align('center')
  enc.bold(true)
  enc.fontSize('double')
  enc.text(truncate(data.businessName, w)).newline()
  enc.fontSize('normal')
  enc.bold(false)

  if (data.outletName) enc.text(data.outletName).newline()
  if (data.address) enc.text(truncate(data.address, w)).newline()
  if (data.phone) enc.text(data.phone).newline()
  if (data.header1) enc.text(truncate(data.header1, w)).newline()
  if (data.header2) enc.text(truncate(data.header2, w)).newline()
  if (data.header3) enc.text(truncate(data.header3, w)).newline()

  enc.align('left')
  enc.line('-', w)

  // --- Order info ---
  enc.row('Order', data.orderNumber, w)
  enc.row('Tanggal', formatDate(data.createdAt), w)
  enc.row('Kasir', data.cashierName, w)
  enc.row(
    'Tipe',
    data.orderType === 'DINE_IN' ? 'Makan di Tempat' : 'Bawa Pulang',
    w,
  )
  if (data.tableName) enc.row('Meja', data.tableName, w)

  enc.line('-', w)

  // --- Items ---
  for (const item of data.items) {
    const nameStr = item.variantName
      ? `${item.name} (${item.variantName})`
      : item.name
    // Item name (truncated to available width)
    enc.text(truncate(nameStr, w)).newline()

    // Toppings
    if (item.toppings && item.toppings.length > 0) {
      for (const topping of item.toppings) {
        enc.text('  + ' + truncate(topping, w - 4)).newline()
      }
    }

    // Notes
    if (item.notes) {
      enc.text('  * ' + truncate(item.notes, w - 4)).newline()
    }

    // Qty × price = subtotal
    const qtyPrice = `${item.quantity} x ${formatRp(item.price)}`
    enc.row('  ' + qtyPrice, formatRp(item.subtotal), w)
  }

  enc.line('-', w)

  // --- Promos ---
  if (data.promos && data.promos.length > 0) {
    for (const promo of data.promos) {
      enc.row(
        truncate(promo.name, w - 12),
        '-' + formatRp(promo.discountAmount),
        w,
      )
    }
  }

  // --- Totals ---
  enc.row('Subtotal', formatRp(data.subtotal), w)
  if (data.discountAmount > 0) {
    enc.row('Diskon', '-' + formatRp(data.discountAmount), w)
  }
  if (data.taxRate > 0) {
    enc.row(`Pajak (${data.taxRate}%)`, formatRp(data.taxAmount), w)
  }
  if (data.serviceRate > 0) {
    enc.row(`Servis (${data.serviceRate}%)`, formatRp(data.serviceAmount), w)
  }

  enc.line('=', w)
  enc.bold(true)
  enc.row('TOTAL', formatRp(data.totalAmount), w)
  enc.bold(false)
  enc.line('-', w)

  // --- Payment ---
  enc.row('Pembayaran', data.paymentMethod, w)
  if (data.cashEntered !== undefined) {
    enc.row('Tunai', formatRp(data.cashEntered), w)
  }
  if (data.changeAmount !== undefined) {
    enc.row('Kembalian', formatRp(data.changeAmount), w)
  }

  enc.line('-', w)

  // --- Footer ---
  enc.align('center')
  const thanks = data.thankYou ?? 'Terima kasih atas kunjungan Anda!'
  enc.text(thanks).newline()
  enc.align('left')

  enc.feed(5)  // Extra feed lines untuk Bluetooth printer
  enc.cut()

  return enc.encode()
}

export function buildKot(data: KotData, paperWidth: PaperWidth = 58): Uint8Array {
  const w = CHAR_WIDTH[paperWidth]
  const enc = new EscPosEncoder()

  enc.initialize()

  // --- KOT Header ---
  enc.align('center')
  enc.bold(true)
  enc.fontSize('double')
  enc.text('KOT').newline()
  enc.fontSize('normal')
  enc.bold(false)

  enc.align('left')
  enc.line('=', w)

  enc.row('Order', data.orderNumber, w)
  enc.row('Waktu', formatDate(data.createdAt), w)
  enc.row('Kasir', data.cashierName, w)
  enc.row(
    'Tipe',
    data.orderType === 'DINE_IN' ? 'Makan di Tempat' : 'Bawa Pulang',
    w,
  )
  if (data.tableName) enc.row('Meja', data.tableName, w)

  enc.line('=', w)

  // --- Items (bold, large) ---
  for (const item of data.items) {
    enc.bold(true)
    const nameStr = item.variantName
      ? `${item.name} (${item.variantName})`
      : item.name
    enc.text(`${item.quantity}x ${truncate(nameStr, w - 3)}`).newline()
    enc.bold(false)

    if (item.toppings && item.toppings.length > 0) {
      for (const topping of item.toppings) {
        enc.text('  + ' + truncate(topping, w - 4)).newline()
      }
    }

    if (item.notes) {
      enc.bold(true)
      enc.text('  ! ' + truncate(item.notes, w - 4)).newline()
      enc.bold(false)
    }
  }

  enc.line('-', w)
  enc.feed(5)  // Extra feed lines untuk Bluetooth printer
  enc.cut()

  return enc.encode()
}

export function buildTestPrint(paperWidth: PaperWidth = 58): Uint8Array {
  const w = CHAR_WIDTH[paperWidth]
  const enc = new EscPosEncoder()

  enc.initialize()

  enc.align('center')
  enc.bold(true)
  enc.fontSize('double')
  enc.text('TEST PRINT').newline()
  enc.fontSize('normal')
  enc.bold(false)

  enc.line('-', w)
  enc.align('left')

  enc.row('Paper Width', `${paperWidth}mm`, w)
  enc.row('Char Width', `${w} chars`, w)
  enc.row('Tanggal', formatDate(new Date()), w)

  enc.line('-', w)

  // Test alignment
  enc.align('left')
  enc.text('Left aligned').newline()
  enc.align('center')
  enc.text('Center aligned').newline()
  enc.align('right')
  enc.text('Right aligned').newline()
  enc.align('left')

  enc.line('-', w)

  // Test bold/underline
  enc.bold(true)
  enc.text('Bold text').newline()
  enc.bold(false)
  enc.underline(true)
  enc.text('Underline text').newline()
  enc.underline(false)

  enc.line('-', w)
  enc.align('center')
  enc.text('Printer OK').newline()
  enc.align('left')

  enc.feed(5)  // Extra feed lines untuk Bluetooth printer
  enc.cut()

  return enc.encode()
}
