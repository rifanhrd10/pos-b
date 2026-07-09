// Common BT thermal printer service/characteristic UUIDs
export const BT_PRINTER_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb'
export const BT_PRINTER_CHAR = '00002af1-0000-1000-8000-00805f9b34fb'

// Bluetooth MTU for safe chunking (actual MTU is negotiated, 512 is the BLE max)
const CHUNK_SIZE = 512

export class WebBluetoothPrinter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private device: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private characteristic: any = null

  // Check if Web Bluetooth API is available
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator
  }

  // Open browser dialog to let user pick a Bluetooth device
  async requestDevice(): Promise<boolean> {
    if (!WebBluetoothPrinter.isSupported()) return false
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [BT_PRINTER_SERVICE] }],
        optionalServices: [BT_PRINTER_SERVICE],
      })
      return true
    } catch {
      return false
    }
  }

  // Connect to GATT server and get the printer characteristic
  async connect(): Promise<boolean> {
    if (!this.device) return false
    try {
      const server = await this.device.gatt!.connect()
      const service = await server.getPrimaryService(BT_PRINTER_SERVICE)
      this.characteristic = await service.getCharacteristic(BT_PRINTER_CHAR)
      return true
    } catch {
      return false
    }
  }

  // Disconnect from GATT server
  async disconnect(): Promise<void> {
    try {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect()
      }
    } catch {
      // Ignore disconnect errors
    } finally {
      this.characteristic = null
      this.device = null
    }
  }

  // True if device is connected and characteristic is available
  isConnected(): boolean {
    return (
      this.device !== null &&
      this.characteristic !== null &&
      (this.device.gatt?.connected ?? false)
    )
  }

  // Write data in CHUNK_SIZE chunks (BLE MTU limitation)
  async print(data: Uint8Array): Promise<boolean> {
    if (!this.characteristic) return false
    try {
      for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
        const chunk = data.slice(offset, offset + CHUNK_SIZE)
        await this.characteristic.writeValueWithoutResponse(chunk)
        // Small delay between chunks to avoid buffer overflow
        if (offset + CHUNK_SIZE < data.length) {
          await new Promise<void>((resolve) => setTimeout(resolve, 20))
        }
      }
      return true
    } catch {
      return false
    }
  }
}
