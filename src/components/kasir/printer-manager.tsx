"use client";

import { useState, useEffect } from "react";
import { Usb, Bluetooth, Printer, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebSerialPrinter } from "@/lib/printer/web-serial";
import { WebBluetoothPrinter } from "@/lib/printer/web-bluetooth";
import { buildTestPrint } from "@/lib/printer/receipt-builder";

interface PrinterManagerProps {
  paperWidth: 58 | 80;
  onPaperWidthChange: (w: 58 | 80) => void;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

// Module-level singletons so connection survives re-renders
let usbPrinter: WebSerialPrinter | null = null;
let btPrinter: WebBluetoothPrinter | null = null;

export function PrinterManager({ paperWidth, onPaperWidthChange }: PrinterManagerProps) {
  const [usbStatus, setUsbStatus] = useState<ConnectionStatus>("disconnected");
  const [btStatus, setBtStatus] = useState<ConnectionStatus>("disconnected");
  const [usbMessage, setUsbMessage] = useState<string>("");
  const [btMessage, setBtMessage] = useState<string>("");

  const usbSupported = WebSerialPrinter.isSupported();
  const btSupported = WebBluetoothPrinter.isSupported();

  // Sync connection status from singletons on mount
  useEffect(() => {
    if (usbPrinter?.isConnected()) setUsbStatus("connected");
    if (btPrinter?.isConnected()) setBtStatus("connected");
  }, []);

  // ── USB ──────────────────────────────────────────────────────────────────

  const handleUsbConnect = async () => {
    setUsbStatus("connecting");
    setUsbMessage("");
    try {
      if (!usbPrinter) usbPrinter = new WebSerialPrinter();
      const requested = await usbPrinter.requestPort();
      if (!requested) {
        setUsbStatus("disconnected");
        setUsbMessage("Tidak ada port yang dipilih.");
        return;
      }
      const connected = await usbPrinter.connect();
      if (connected) {
        setUsbStatus("connected");
        setUsbMessage("Printer USB terhubung.");
      } else {
        setUsbStatus("error");
        setUsbMessage("Gagal terhubung ke printer USB.");
      }
    } catch {
      setUsbStatus("error");
      setUsbMessage("Terjadi kesalahan saat menghubungkan USB.");
    }
  };

  const handleUsbDisconnect = async () => {
    if (usbPrinter) {
      await usbPrinter.disconnect();
      usbPrinter = null;
    }
    setUsbStatus("disconnected");
    setUsbMessage("");
  };

  const handleUsbTestPrint = async () => {
    if (!usbPrinter?.isConnected()) {
      setUsbMessage("Printer USB belum tersambung.");
      return;
    }
    const data = buildTestPrint(paperWidth);
    const ok = await usbPrinter.printAndCut(data);
    setUsbMessage(ok ? "Test print berhasil!" : "Gagal mencetak test print.");
  };

  // ── Bluetooth ─────────────────────────────────────────────────────────────

  const handleBtConnect = async () => {
    setBtStatus("connecting");
    setBtMessage("");
    try {
      if (!btPrinter) btPrinter = new WebBluetoothPrinter();
      const requested = await btPrinter.requestDevice();
      if (!requested) {
        setBtStatus("disconnected");
        setBtMessage("Tidak ada perangkat yang dipilih.");
        return;
      }
      const connected = await btPrinter.connect();
      if (connected) {
        setBtStatus("connected");
        setBtMessage("Printer Bluetooth terhubung.");
      } else {
        setBtStatus("error");
        setBtMessage("Gagal terhubung ke printer Bluetooth.");
      }
    } catch {
      setBtStatus("error");
      setBtMessage("Terjadi kesalahan saat menghubungkan Bluetooth.");
    }
  };

  const handleBtDisconnect = async () => {
    if (btPrinter) {
      await btPrinter.disconnect();
      btPrinter = null;
    }
    setBtStatus("disconnected");
    setBtMessage("");
  };

  const handleBtTestPrint = async () => {
    if (!btPrinter?.isConnected()) {
      setBtMessage("Printer Bluetooth belum tersambung.");
      return;
    }
    const data = buildTestPrint(paperWidth);
    const ok = await btPrinter.print(data);
    setBtMessage(ok ? "Test print berhasil!" : "Gagal mencetak test print.");
  };

  // ── Browser Print ──────────────────────────────────────────────────────────

  const handleBrowserTestPrint = () => {
    window.print();
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: ConnectionStatus }) => {
    if (status === "connected")
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <CheckCircle className="h-3.5 w-3.5" /> Terhubung
        </span>
      );
    if (status === "connecting")
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menghubungkan...
        </span>
      );
    if (status === "error")
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <XCircle className="h-3.5 w-3.5" /> Error
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
        <XCircle className="h-3.5 w-3.5" /> Tidak Terhubung
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Paper Width */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="mb-3 font-semibold text-slate-800">Lebar Kertas</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onPaperWidthChange(58)}
            className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors ${
              paperWidth === 58
                ? "border-bayaro-blue bg-bayaro-soft text-bayaro-navy"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            58mm
          </button>
          <button
            onClick={() => onPaperWidthChange(80)}
            className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors ${
              paperWidth === 80
                ? "border-bayaro-blue bg-bayaro-soft text-bayaro-navy"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            80mm
          </button>
        </div>
      </div>

      {/* Browser Print */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <Printer className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Print Browser</h3>
            <p className="text-xs text-slate-500">Tersedia di semua browser</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBrowserTestPrint} className="w-full">
          Test Print (Browser)
        </Button>
      </div>

      {/* USB Printer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Usb className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Printer USB</h3>
              <p className="text-xs text-slate-500">Web Serial API (Chrome)</p>
            </div>
          </div>
          <StatusBadge status={usbStatus} />
        </div>

        {!usbSupported ? (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
            Browser Anda tidak mendukung Web Serial. Gunakan Chrome atau Edge versi terbaru.
          </p>
        ) : (
          <div className="space-y-2">
            {usbStatus === "connected" ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleUsbTestPrint}
                  className="flex-1"
                >
                  Test Print
                </Button>
                <Button
                  variant="danger"
                  onClick={handleUsbDisconnect}
                  className="flex-1"
                >
                  Putuskan
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleUsbConnect}
                isLoading={usbStatus === "connecting"}
                className="w-full"
              >
                Sambungkan USB
              </Button>
            )}
            {usbMessage && (
              <p
                className={`text-xs px-3 py-2 rounded-xl ${
                  usbMessage.includes("berhasil")
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {usbMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bluetooth Printer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Bluetooth className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Printer Bluetooth</h3>
              <p className="text-xs text-slate-500">Web Bluetooth API (Chrome)</p>
            </div>
          </div>
          <StatusBadge status={btStatus} />
        </div>

        {!btSupported ? (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
            Browser Anda tidak mendukung Web Bluetooth. Gunakan Chrome versi terbaru.
          </p>
        ) : (
          <div className="space-y-2">
            {btStatus === "connected" ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBtTestPrint}
                  className="flex-1"
                >
                  Test Print
                </Button>
                <Button
                  variant="danger"
                  onClick={handleBtDisconnect}
                  className="flex-1"
                >
                  Putuskan
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleBtConnect}
                isLoading={btStatus === "connecting"}
                className="w-full"
              >
                Sambungkan Bluetooth
              </Button>
            )}
            {btMessage && (
              <p
                className={`text-xs px-3 py-2 rounded-xl ${
                  btMessage.includes("berhasil")
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {btMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
