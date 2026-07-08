import { auth, getBusinessContext } from "@/lib/auth";
import { getPromo } from "@/actions/promo";
import { getProducts } from "@/actions/products";
import { notFound, redirect } from "next/navigation";
import { PromoForm } from "@/components/shared/promo-form";

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const { id } = await params;
  const [promo, products] = await Promise.all([
    getPromo(id),
    getProducts(ctx.businessId),
  ]);

  if (!promo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Promo</h1>
        <p className="text-sm text-slate-500">Perbarui detail promo</p>
      </div>
      <PromoForm
        businessId={ctx.businessId}
        products={products.map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice }))}
        initialData={{
          id: promo.id,
          name: promo.name,
          description: promo.description ?? undefined,
          type: promo.type,
          discountType: promo.discountType,
          discountValue: Number(promo.discountValue),
          code: promo.code ?? undefined,
          minOrderAmount: promo.minOrderAmount ? Number(promo.minOrderAmount) : undefined,
          maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : undefined,
          usageLimit: promo.usageLimit ?? undefined,
          startDate: promo.startDate
            ? new Date(promo.startDate).toISOString().split("T")[0]
            : undefined,
          endDate: promo.endDate
            ? new Date(promo.endDate).toISOString().split("T")[0]
            : undefined,
          startHour: promo.startHour ?? undefined,
          endHour: promo.endHour ?? undefined,
          isActive: promo.isActive,
          bundleItems: promo.bundleItems.map((item) => ({
            productId: item.productId,
            requiredQty: item.requiredQty,
            freeQty: item.freeQty,
          })),
        }}
        onSuccess={() => {}}
      />
    </div>
  );
}
