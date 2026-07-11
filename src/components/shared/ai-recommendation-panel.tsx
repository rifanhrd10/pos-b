"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";

type ProductDraft = {
  name: string;
  basePrice?: number;
  description?: string;
  categoryName?: string;
  variants?: { name: string; priceAdjustment: number }[];
  toppings?: { name: string; price: number }[];
};

type RecommendationResponse = {
  success?: true;
  error?: string;
  businessType?: string;
  templates?: ProductDraft[];
  gemini?: ProductDraft[];
  geminiError?: string | null;
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5">
      <div className="mb-3 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mb-2 h-3 w-1/2 rounded bg-slate-100" />
      <div className="h-3 w-1/4 rounded bg-slate-100" />
    </div>
  );
}

export function AIRecommendationPanel() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savingSingle, setSavingSingle] = useState<number | null>(null);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/ai/recommend");
        if (!res.ok) throw new Error("Gagal memuat rekomendasi");
        const json = (await res.json()) as RecommendationResponse;
        if (!cancelled) {
          if (json.error) {
            setError(json.error);
          } else {
            setData(json);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchRecommendations();
    return () => { cancelled = true; };
  }, []);

  const allItems = useCallback(() => {
    if (!data) return [];
    const map = new Map<string, ProductDraft>();
    for (const item of [...(data.templates ?? []), ...(data.gemini ?? [])]) {
      if (!map.has(item.name.toLowerCase())) {
        map.set(item.name.toLowerCase(), item);
      }
    }
    return Array.from(map.values());
  }, [data]);

  const items = allItems();

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleBulkCreate() {
    const drafts = Array.from(selected).map((i) => items[i]);
    if (!drafts.length) return;
    setSaving(true);
    setCreateError("");
    try {
      const { createRecommendedProducts } = await import("@/actions/ai");
      const result = await createRecommendedProducts(drafts);
      if (result.error) {
        setCreateError(getErrorMessage(result.error));
      } else {
        router.push("/products");
        router.refresh();
      }
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSingleCreate(index: number) {
    setSavingSingle(index);
    setCreateError("");
    try {
      const { createRecommendedProducts } = await import("@/actions/ai");
      const result = await createRecommendedProducts([items[index]]);
      if (result.error) {
        setCreateError(getErrorMessage(result.error));
      } else {
        router.push("/products");
        router.refresh();
      }
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setSavingSingle(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/60 to-white p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-800">Rekomendasi AI</h3>
        </div>
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !data || !items.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/60 to-white p-6 shadow-soft">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-slate-800">Rekomendasi AI</h3>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Rekomendasi untuk tipe bisnis{" "}
        <span className="font-medium capitalize text-slate-700">{data.businessType}</span>
      </p>

      {data.geminiError && (
        <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          {data.geminiError}
        </div>
      )}

      {createError && (
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {createError}
        </div>
      )}

      <div className="mb-4 space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200",
              selected.has(i)
                ? "border-indigo-300 bg-indigo-50/80 ring-1 ring-indigo-300"
                : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                selected.has(i)
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-slate-300"
              )}
            >
              {selected.has(i) && <Check className="h-3 w-3" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-sm font-medium text-slate-800">{item.name}</span>
                {item.basePrice !== undefined && (
                  <span className="shrink-0 text-xs font-semibold text-indigo-600">
                    Rp{item.basePrice.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              {item.categoryName && (
                <span className="text-xs text-slate-400">{item.categoryName}</span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                void handleSingleCreate(i);
              }}
              disabled={savingSingle === i}
              isLoading={savingSingle === i}
              className="shrink-0"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tambah 1
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={() => void handleBulkCreate()}
          disabled={selected.size === 0 || saving}
          isLoading={saving}
        >
          Tambahkan yang dipilih ({selected.size})
        </Button>
        <Button type="button" variant="secondary" onClick={() => setSelected(new Set())}>
          Hapus pilihan
        </Button>
      </div>
    </div>
  );
}
