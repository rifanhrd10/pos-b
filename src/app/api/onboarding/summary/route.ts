import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      outlets: { select: { name: true } },
      subscription: { include: { plan: { select: { displayName: true } } } },
      shifts: { where: { isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const trialEndsAt = business.subscription?.trialEndsAt
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
        business.subscription.trialEndsAt
      )
    : "-";

  const TYPE_LABELS: Record<string, string> = {
    COFFEE_SHOP: "Coffee Shop",
    RESTAURANT: "Restaurant",
    VAPE_STORE: "Vape Store",
    BARBERSHOP: "Barbershop",
    RETAIL: "Retail",
    FNB: "F&B",
    LAUNDRY: "Laundry",
    OTHER: "Lainnya",
  };

  return NextResponse.json({
    businessName: business.name,
    businessType: TYPE_LABELS[business.type] ?? business.type,
    planName: business.subscription?.plan?.displayName ?? "Starter",
    trialEndsAt,
    outletCount: business.outlets.length,
    outletNames: business.outlets.map((o) => o.name),
    openTime: business.openTime ?? "08:00",
    closeTime: business.closeTime ?? "22:00",
    hasShift: business.hasShift,
    shiftCount: business.shifts.length,
  });
}
