"use client";

import { useState } from "react";
import { Camera, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductDraft } from "@/lib/ai/types";

export function MenuOcrImporter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/ai/scan-menu", { method: "POST", body: fd });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.drafts?.length) {
        setDrafts(data.drafts);
        setSelected(new Set(data.drafts.map((_: ProductDraft, i: number) => i)));
      } else {
        setError("Tidak ada item yang terdeteksi di gambar");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  function updateDraft(index: number, field: keyof ProductDraft, value: ProductDraft[keyof ProductDraft]) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  async function saveSelected() {
    setSaving(true);
    const selectedDrafts = Array.from(selected).map((i) => drafts[i]);
    const { createRecommendedProducts } = await import("@/actions/ai");
    const result = await createRecommendedProducts(selectedDrafts);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setDrafts([]);
    setSelected(new Set());
    setPreview(null);
    window.location.reload();
  }

  function resetAll() {
    setDrafts([]);
    setSelected(new Set());
    setPreview(null);
    setError(null);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800">
          <Camera className="h-4 w-4 text-cyan-500" />
          Scan Foto Menu
        </h3>
        {drafts.length > 0 && (
          <button
            onClick={resetAll}
            className="text-xs text-slate-400 underline hover:text-red-500"
          >
            Reset
          </button>
        )}
      </div>

      {drafts.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition-all hover:border-cyan-400">
          <Camera className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Foto menu restoran Anda</p>
          <p className="mt-1 text-xs text-slate-400">AI akan membaca daftar menu dari foto</p>
          <label className="mt-3 inline-block">
            <span className="cursor-pointer rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600">
              Upload Foto
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          <div className="text-sm text-slate-500">
            <p className="font-medium">Memproses gambar...</p>
            <p className="text-xs">AI sedang membaca menu Anda</p>
          </div>
        </div>
      )}

      {preview && drafts.length > 0 && (
        <img src={preview} alt="Menu preview" className="max-h-32 rounded-xl border border-slate-200" />
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          <X className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:underline">
            Tutup
          </button>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">{drafts.length} item terdeteksi</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {drafts.map((draft, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-500"
                />
                <div className="min-w-0 flex-1">
                  <input
                    className="w-full border-b border-transparent bg-transparent text-sm font-medium text-slate-800 hover:border-slate-300 focus:border-cyan-400 focus:outline-none"
                    value={draft.name}
                    onChange={(e) => updateDraft(i, "name", e.target.value)}
                  />
                  <div className="mt-0.5 flex gap-2 text-xs text-slate-400">
                    <span>{draft.categoryName || "Tanpa kategori"}</span>
                    {draft.basePrice !== undefined && (
                      <span>Rp {draft.basePrice.toLocaleString("id-ID")}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected.size > 0 && (
            <Button
              onClick={saveSelected}
              disabled={saving}
              className="mt-2 w-full bg-cyan-500 hover:bg-cyan-600"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" /> Tambahkan {selected.size} item ke katalog
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
