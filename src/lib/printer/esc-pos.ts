// ESC/POS command constants
const ESC = 0x1b
const GS = 0x1d
// const FS = 0x1c  // reserved for future use
const LF = 0x0a
// const NUL = 0x00  // reserved for future use

export class EscPosEncoder {
  private buffer: number[] = []

  // Reset printer to default settings
  initialize(): this {
    this.buffer.push(ESC, 0x40) // ESC @
    return this
  }

  // Print text string (UTF-8 encoded)
  text(str: string): this {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    bytes.forEach((b) => this.buffer.push(b))
    return this
  }

  // Print newline(s)
  newline(count = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(LF)
    }
    return this
  }

  // Toggle bold
  bold(on: boolean): this {
    this.buffer.push(ESC, 0x45, on ? 1 : 0) // ESC E n
    return this
  }

  // Toggle underline (0=off, 1=1-dot, 2=2-dot)
  underline(on: boolean): this {
    this.buffer.push(ESC, 0x2d, on ? 1 : 0) // ESC - n
    return this
  }

  // Set text alignment
  align(pos: 'left' | 'center' | 'right'): this {
    const n = pos === 'left' ? 0 : pos === 'center' ? 1 : 2
    this.buffer.push(ESC, 0x61, n) // ESC a n
    return this
  }

  // Set font size
  fontSize(size: 'normal' | 'double-width' | 'double-height' | 'double'): this {
    let n = 0x00
    if (size === 'double-width') n = 0x10
    else if (size === 'double-height') n = 0x01
    else if (size === 'double') n = 0x11
    this.buffer.push(GS, 0x21, n) // GS ! n
    return this
  }

  // Print a horizontal line of `char` repeated `width` times
  line(char = '-', width = 32): this {
    this.text(char.repeat(width))
    this.newline()
    return this
  }

  // Print two-column row: left-aligned left, right-aligned right, total = width
  row(left: string, right: string, width = 32): this {
    const available = width - left.length - right.length
    const spaces = available > 0 ? ' '.repeat(available) : ' '
    this.text(left + spaces + right)
    this.newline()
    return this
  }

  // Full paper cut
  cut(): this {
    this.buffer.push(GS, 0x56, 0x00) // GS V 0
    return this
  }

  // Partial paper cut
  partialCut(): this {
    this.buffer.push(GS, 0x56, 0x01) // GS V 1
    return this
  }

  // Open cash drawer on pin 2
  openCashDrawer(): this {
    this.buffer.push(ESC, 0x70, 0x00, 25, 250) // ESC p 0 t1 t2
    return this
  }

  // Print QR code using GS ( k sequence (model 2)
  qrCode(data: string, size = 6): this {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(data)
    const len = bytes.length + 3
    const lenL = len & 0xff
    const lenH = (len >> 8) & 0xff

    // Select QR model: GS ( k pL pH cn fn n1 n2  (model 2)
    this.buffer.push(GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00)

    // Set QR size: GS ( k pL pH cn fn n
    this.buffer.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size)

    // Set error correction: GS ( k pL pH cn fn n  (level M = 0x31)
    this.buffer.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31)

    // Store data: GS ( k pL pH cn fn [data]
    this.buffer.push(GS, 0x28, 0x6b, lenL, lenH, 0x31, 0x50, 0x30)
    bytes.forEach((b) => this.buffer.push(b))

    // Print: GS ( k pL pH cn fn m
    this.buffer.push(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30)

    return this
  }

  // Feed N lines
  feed(lines = 1): this {
    this.buffer.push(ESC, 0x64, lines) // ESC d n
    return this
  }

  // Return final byte array
  encode(): Uint8Array {
    return new Uint8Array(this.buffer)
  }

  // Clear buffer and reset
  reset(): this {
    this.buffer = []
    return this
  }
}
