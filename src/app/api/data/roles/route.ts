import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!business) return NextResponse.json([]);

  const roles = await prisma.role.findMany({
    where: { businessId: business.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(roles);
}
