"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emitToast } from "@/components/ui/toast-provider";

export function ProductDetailActions({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const ok = window.confirm(`Hapus produk "${productName}"? Produk yang sudah punya transaksi akan dinonaktifkan otomatis.`);
    if (!ok) return;

    startTransition(async () => {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        emitToast({ tone: "error", title: "Produk gagal dihapus", description: result.message });
        return;
      }

      emitToast({ tone: "success", title: "Produk dihapus", description: result.message });
      router.push("/produk");
      router.refresh();
    });
  }

  return (
    <>
      <Link href={`/produk/${productId}/edit`}>
        <Button>Edit Produk</Button>
      </Link>
      <Button variant="danger" onClick={handleDelete} disabled={pending} className="gap-2">
        <Trash2 size={16} />
        {pending ? "Menghapus..." : "Hapus Produk"}
      </Button>
    </>
  );
}
