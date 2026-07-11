import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
    select: {
      id: true,
      name: true,
      displayName: true,
      maxOutlets: true,
      maxEmployees: true,
      features: true,
      price: true,
    },
  });
  return NextResponse.json(plans);
}
