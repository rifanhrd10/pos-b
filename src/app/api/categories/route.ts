import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json([], { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }
  const ctx = await getBusinessContext(session.user.id);
  if (!ctx || ctx.businessId !== businessId) {
    return NextResponse.json([], { status: 403 });
  }

  const categories = await prisma.category.findMany({
    where: { businessId },
    select: { id: true, name: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(categories);
}
