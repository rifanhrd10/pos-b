"use client";

import { useState, useTransition } from "react";
import {
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
} from "@/actions/settings";

// Prisma types from schema
type PaymentMethodType = "CASH" | "QRIS_STATIC" | "QRIS_DYNAMIC" | "BANK_TRANSFER" | "EWALLET";
type QrisProvider = "MIDTRANS" | "XENDIT" | "CUSTOM";

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isEnabled: boolean;
  sortOrder: number;
  qrisImage: string | null;
  qrisNote: string | null;
  provider: QrisProvider | null;
  apiKey: string | null;
  apiSecret: string | null;
  apiEndpoint: string | null;
  merchantId: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  walletNumber: string | null;
  walletName: string | null;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
}

interface Props {
  methods: PaymentMethod[];
  businessId: string;
}

// Shared toggle switch component
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Label + input field
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function inputClass() {
  return "h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
}

// ─── CASH SECTION ───────────────────────────────────────────────────────────

function CashSection({ method }: { method: PaymentMethod | undefined }) {
  const [isPending, startTransition] = useTransition();
  const [isEnabled, setIsEnabled] = useState(method?.isEnabled ?? false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  function handleToggle(val: boolean) {
    setIsEnabled(val);
    startTransition(async () => {
      if (method) {
        const res = await togglePaymentMethod(method.id, val);
        if (!res.success) {
          setIsEnabled(!val);
          showToast("error", res.error ?? "Gagal mengubah status");
        } else {
          showToast("success", val ? "Cash diaktifkan" : "Cash dinonaktifkan");
        }
      } else {
        // Create cash method
        const res = await createPaymentMethod({
          type: "CASH",
          name: "Cash",
          isEnabled: true,
          sortOrder: 0,
        });
        if (!res.success) {
          setIsEnabled(false);
          showToast("error", res.error ?? "Gagal membuat metode pembayaran");
        } else {
          showToast("success", "Cash diaktifkan");
        }
      }
    });
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💵</span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Cash</h2>
            <p className="text-sm text-slate-500">Pembayaran tunai</p>
          </div>
        </div>
        <Toggle checked={isEnabled} onChange={handleToggle} disabled={isPending} />
      </div>
      <p className="mt-3 text-sm text-slate-400">Tidak memerlukan konfigurasi tambahan</p>
      {toast && (
        <p
          className={`mt-3 text-sm ${
            toast.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {toast.msg}
        </p>
      )}
    </div>
  );
}

// ─── QRIS STATIC SECTION ────────────────────────────────────────────────────

function QrisStaticSection({ method }: { method: PaymentMethod | undefined }) {
  const [isPending, startTransition] = useTransition();
  const [isEnabled, setIsEnabled] = useState(method?.isEnabled ?? false);
  const [qrisImage, setQrisImage] = useState(method?.qrisImage ?? "");
  const [qrisNote, setQrisNote] = useState(
    method?.qrisNote ??
      "Tampilkan QR ke customer dan klik 'Sudah Dibayar' setelah customer konfirmasi"
  );
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  function handleToggle(val: boolean) {
    setIsEnabled(val);
    if (method) {
      startTransition(async () => {
        const res = await togglePaymentMethod(method.id, val);
        if (!res.success) {
          setIsEnabled(!val);
          showToast("error", res.error ?? "Gagal mengubah status");
        }
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        type: "QRIS_STATIC" as const,
        name: "QRIS Statis",
        isEnabled,
        sortOrder: 1,
        qrisImage: qrisImage || undefined,
        qrisNote: qrisNote || undefined,
      };

      let res: { success: boolean; error?: string };
      if (method) {
        res = await updatePaymentMethod(method.id, data);
      } else {
        res = await createPaymentMethod(data);
      }

      if (res.success) {
        showToast("success", "QRIS Statis berhasil disimpan");
      } else {
        showToast("error", res.error ?? "Gagal menyimpan");
      }
    });
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">QRIS Statis</h2>
            <p className="text-sm text-slate-500">QR Code statis untuk pembayaran</p>
          </div>
        </div>
        <Toggle checked={isEnabled} onChange={handleToggle} disabled={isPending || !method} />
      </div>

      {/* Warning banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-800 mb-4">
        <p className="font-medium mb-0.5">⚠️ Verifikasi Manual Diperlukan</p>
        <p>
          QRIS Statis tidak dapat memverifikasi pembayaran secara otomatis. Kasir harus konfirmasi
          manual.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="URL Gambar QR Code">
          <input
            type="text"
            value={qrisImage}
            onChange={(e) => setQrisImage(e.target.value)}
            placeholder="https://... atau path gambar QR"
            className={inputClass()}
          />
          {qrisImage && (
            <div className="mt-2 rounded-xl border border-slate-200 p-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrisImage}
                alt="QR Code preview"
                className="max-h-40 max-w-40 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </Field>

        <Field label="Catatan untuk kasir">
          <textarea
            value={qrisNote}
            onChange={(e) => setQrisNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </Field>

        {toast && (
          <p
            className={`text-sm ${toast.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {toast.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}

// ─── QRIS DYNAMIC / API SECTION ──────────────────────────────────────────────

const PROVIDER_LABELS: Record<QrisProvider, string> = {
  MIDTRANS: "Midtrans",
  XENDIT: "Xendit",
  CUSTOM: "Custom",
};

const PLACEHOLDER_KEY = "••••••••";

function QrisDynamicSection({ method }: { method: PaymentMethod | undefined }) {
  const [isPending, startTransition] = useTransition();
  const [isEnabled, setIsEnabled] = useState(method?.isEnabled ?? false);
  const [provider, setProvider] = useState<QrisProvider>(method?.provider ?? "MIDTRANS");

  // Midtrans fields
  const [mtServerKey, setMtServerKey] = useState(method?.provider === "MIDTRANS" && method.apiKey ? PLACEHOLDER_KEY : "");
  const [mtClientKey, setMtClientKey] = useState(method?.provider === "MIDTRANS" && method.apiSecret ? PLACEHOLDER_KEY : "");
  const [mtMerchantId, setMtMerchantId] = useState(method?.provider === "MIDTRANS" ? (method.merchantId ?? "") : "");
  const [mtMode, setMtMode] = useState<"sandbox" | "production">("sandbox");

  // Xendit fields
  const [xdSecretKey, setXdSecretKey] = useState(method?.provider === "XENDIT" && method.apiKey ? PLACEHOLDER_KEY : "");
  const [xdWebhookToken, setXdWebhookToken] = useState(method?.provider === "XENDIT" && method.apiSecret ? PLACEHOLDER_KEY : "");
  const [xdMode, setXdMode] = useState<"test" | "live">("test");

  // Custom fields
  const [customEndpoint, setCustomEndpoint] = useState(method?.provider === "CUSTOM" ? (method.apiEndpoint ?? "") : "");
  const [customApiKey, setCustomApiKey] = useState(method?.provider === "CUSTOM" && method.apiKey ? PLACEHOLDER_KEY : "");
  const [customApiSecret, setCustomApiSecret] = useState(method?.provider === "CUSTOM" && method.apiSecret ? PLACEHOLDER_KEY : "");

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isConfigured = !!method?.provider;

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  function handleToggle(val: boolean) {
    setIsEnabled(val);
    if (method) {
      startTransition(async () => {
        const res = await togglePaymentMethod(method.id, val);
        if (!res.success) {
          setIsEnabled(!val);
          showToast("error", res.error ?? "Gagal mengubah status");
        }
      });
    }
  }

  function buildPayload() {
    const base = {
      type: "QRIS_DYNAMIC" as const,
      name: "Payment Gateway",
      isEnabled,
      sortOrder: 2,
      provider,
    };

    if (provider === "MIDTRANS") {
      return {
        ...base,
        merchantId: mtMerchantId || undefined,
        apiKey: mtServerKey === PLACEHOLDER_KEY ? undefined : mtServerKey || undefined,
        apiSecret: mtClientKey === PLACEHOLDER_KEY ? undefined : mtClientKey || undefined,
      };
    }
    if (provider === "XENDIT") {
      return {
        ...base,
        apiKey: xdSecretKey === PLACEHOLDER_KEY ? undefined : xdSecretKey || undefined,
        apiSecret: xdWebhookToken === PLACEHOLDER_KEY ? undefined : xdWebhookToken || undefined,
      };
    }
    // CUSTOM
    return {
      ...base,
      apiEndpoint: customEndpoint || undefined,
      apiKey: customApiKey === PLACEHOLDER_KEY ? undefined : customApiKey || undefined,
      apiSecret: customApiSecret === PLACEHOLDER_KEY ? undefined : customApiSecret || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = buildPayload();
      let res: { success: boolean; error?: string };
      if (method) {
        res = await updatePaymentMethod(method.id, payload);
      } else {
        res = await createPaymentMethod(payload);
      }
      if (res.success) {
        showToast("success", "Konfigurasi berhasil disimpan");
      } else {
        showToast("error", res.error ?? "Gagal menyimpan");
      }
    });
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔌</span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Payment Gateway API</h2>
            <p className="text-sm text-slate-500">QRIS Dinamis via payment gateway</p>
          </div>
        </div>
        <Toggle checked={isEnabled} onChange={handleToggle} disabled={isPending || !method} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provider selector */}
        <Field label="Provider">
          <div className="flex gap-2">
            {(["MIDTRANS", "XENDIT", "CUSTOM"] as QrisProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  provider === p
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
        </Field>

        {/* Midtrans fields */}
        {provider === "MIDTRANS" && (
          <>
            <Field label="Server Key">
              <input
                type="password"
                value={mtServerKey}
                onChange={(e) => setMtServerKey(e.target.value)}
                placeholder="SB-Mid-server-..."
                className={inputClass()}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Client Key">
              <input
                type="password"
                value={mtClientKey}
                onChange={(e) => setMtClientKey(e.target.value)}
                placeholder="SB-Mid-client-..."
                className={inputClass()}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Merchant ID">
              <input
                type="text"
                value={mtMerchantId}
                onChange={(e) => setMtMerchantId(e.target.value)}
                placeholder="G123456789"
                className={inputClass()}
              />
            </Field>
            <Field label="Mode">
              <select
                value={mtMode}
                onChange={(e) => setMtMode(e.target.value as "sandbox" | "production")}
                className={inputClass()}
              >
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </Field>
          </>
        )}

        {/* Xendit fields */}
        {provider === "XENDIT" && (
          <>
            <Field label="Secret Key">
              <input
                type="password"
                value={xdSecretKey}
                onChange={(e) => setXdSecretKey(e.target.value)}
                placeholder="xnd_production_..."
                className={inputClass()}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Webhook Token">
              <input
                type="password"
                value={xdWebhookToken}
                onChange={(e) => setXdWebhookToken(e.target.value)}
                placeholder="Webhook verification token"
                className={inputClass()}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Mode">
              <select
                value={xdMode}
                onChange={(e) => setXdMode(e.target.value as "test" | "live")}
                className={inputClass()}
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </Field>
          </>
        )}

        {/* Custom fields */}
        {provider === "CUSTOM" && (
          <>
            <Field label="API Endpoint">
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://api.yourgateway.com/payment"
                className={inputClass()}
              />
            </Field>
            <Field label="API Key">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="API Key"
                className={inputClass()}
                autoComplete="new-password"
              />
            </Field>
            <Field label="API Secret">
              <input
                type="password"
                value={customApiSecret}
                onChange={(e) => setCustomApiSecret(e.target.value)}
                placeholder="API Secret"
                className={inputClass()}
                autoComplete="new-password"
              />
            </Field>
          </>
        )}

        {/* Security note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          🔒 API Key disimpan di server dan tidak ditampilkan setelah disimpan. Isi ulang hanya
          jika ingin mengganti.
        </div>

        {/* Phase info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-600">
          ℹ️ Integrasi aktif tersedia di Phase 6
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Status:</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isConfigured
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isConfigured ? "Terkonfigurasi" : "Belum dikonfigurasi"}
          </span>
        </div>

        {toast && (
          <p
            className={`text-sm ${toast.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {toast.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
        </button>
      </form>
    </div>
  );
}

// ─── ROOT CLIENT COMPONENT ───────────────────────────────────────────────────

export function PaymentSettingsClient({ methods }: Props) {
  const cashMethod = methods.find((m) => m.type === "CASH");
  const qrisStaticMethod = methods.find((m) => m.type === "QRIS_STATIC");
  const qrisDynamicMethod = methods.find((m) => m.type === "QRIS_DYNAMIC");

  return (
    <div>
      <CashSection method={cashMethod} />
      <QrisStaticSection method={qrisStaticMethod} />
      <QrisDynamicSection method={qrisDynamicMethod} />
    </div>
  );
}
