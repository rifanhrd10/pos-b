import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const methods = await prisma.paymentMethod.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(methods);
}
