import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProducts } from "@/actions/products";
import { PromoForm } from "@/components/shared/promo-form";

export default async function NewPromoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const products = await getProducts(ctx.businessId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Buat Promo Baru</h1>
        <p className="text-sm text-slate-500">Tambahkan voucher, bundle, atau happy hour</p>
      </div>
      <PromoForm
        businessId={ctx.businessId}
        products={products.map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice }))}
        onSuccess={() => {}}
      />
    </div>
  );
}
