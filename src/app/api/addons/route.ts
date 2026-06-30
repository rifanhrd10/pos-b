import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const addons = await prisma.addon.findMany({
    include: { outletAddons: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(addons);
}
