import { auth, getBusinessContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TransferForm from "./transfer-form";

export default async function NewTransferPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getBusinessContext(session.user.id);
  if (!ctx) redirect("/dashboard");

  const [outlets, products] = await Promise.all([
    prisma.outlet.findMany({
      where: { businessId: ctx.businessId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { businessId: ctx.businessId, isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        variants: { select: { id: true, name: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TransferForm
      outlets={outlets}
      products={products}
      businessId={ctx.businessId}
      createdBy={session.user.id}
    />
  );
}
