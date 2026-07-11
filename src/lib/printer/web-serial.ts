// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySerial = any

export interface PrinterDevice {
  name: string
  port: AnySerial
}

export class WebSerialPrinter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private port: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private writer: any = null

  // Check if Web Serial API is available in this browser
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator
  }

  // Open browser dialog to let user pick a serial port
  async requestPort(): Promise<boolean> {
    if (!WebSerialPrinter.isSupported()) return false
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.port = await (navigator as any).serial.requestPort()
      return true
    } catch {
      // User cancelled or error
      return false
    }
  }

  // Open the port at the given baud rate
  async connect(baudRate = 9600): Promise<boolean> {
    if (!this.port) return false
    try {
      await this.port.open({ baudRate })
      this.writer = this.port.writable.getWriter()
      return true
    } catch {
      return false
    }
  }

  // Close writer and port
  async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.releaseLock()
        this.writer = null
      }
      if (this.port) {
        await this.port.close()
        this.port = null
      }
    } catch {
      // Ignore disconnect errors
    }
  }

  // True if port is open and writer is available
  isConnected(): boolean {
    return this.port !== null && this.writer !== null
  }

  // Send raw bytes to the printer
  async print(data: Uint8Array): Promise<boolean> {
    if (!this.writer) return false
    try {
      await this.writer.write(data)
      return true
    } catch {
      return false
    }
  }

  // Send raw bytes and then cut (caller should include cut bytes in data,
  // or this method appends ESC/POS cut after writing)
  async printAndCut(data: Uint8Array): Promise<boolean> {
    if (!this.writer) return false
    try {
      // Append GS V 0 (full cut) to the data
      const cut = new Uint8Array([0x1d, 0x56, 0x00])
      const combined = new Uint8Array(data.length + cut.length)
      combined.set(data, 0)
      combined.set(cut, data.length)
      await this.writer.write(combined)
      return true
    } catch {
      return false
    }
  }
}
