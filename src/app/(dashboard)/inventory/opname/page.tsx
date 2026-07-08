import { auth, getBusinessContext } from "@/lib/auth";
import { getActiveOutletId } from "@/lib/outlet-context";
import { startOpname } from "@/actions/opname";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import OpnameForm from "./opname-form";

export const dynamic = "force-dynamic";

export default async function OpnamePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const activeOutletId = await getActiveOutletId();

  if (!activeOutletId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Opname</h1>
          <p className="text-sm text-slate-500">Hitung stok aktual produk</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-12 shadow-soft">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <ClipboardList className="h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              Pilih outlet terlebih dahulu untuk melakukan stok opname
            </p>
          </div>
        </div>
      </div>
    );
  }

  const result = await startOpname(activeOutletId, ctx.businessId);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Opname</h1>
          <p className="text-sm text-slate-500">Hitung stok aktual produk</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-12 shadow-soft">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <ClipboardList className="h-12 w-12 text-red-300" />
            <p className="text-sm font-medium text-red-600">
              Gagal memuat data stok: {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OpnameForm
      items={result.items}
      outletId={activeOutletId}
      userId={session.user.id}
    />
  );
}
