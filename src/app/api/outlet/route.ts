import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { outletSchema } from "@/lib/validations";

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("form")) {
    return Object.fromEntries((await request.formData()).entries());
  }
  return request.json();
}

function expectsJson(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";
  return contentType.includes("application/json") || accept.includes("application/json");
}

export async function GET() {
  const outlet = await prisma.outlet.findFirst({ where: { deletedAt: null } });
  return NextResponse.json(outlet);
}

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const parsed = outletSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input outlet tidak valid." }, { status: 400 });
  }

  const outlet = await prisma.outlet.findFirstOrThrow({ where: { deletedAt: null } });
  const updatedOutlet = await prisma.outlet.update({
    where: { id: outlet.id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      taxRate: parsed.data.taxRate,
      serviceChargeRate: parsed.data.serviceChargeRate,
      receiptFooter: parsed.data.receiptFooter || null,
    },
  });

  if (expectsJson(request)) {
    return NextResponse.json({ message: "Profil outlet berhasil disimpan.", outlet: updatedOutlet });
  }

  return NextResponse.redirect(new URL("/outlet", request.url));
}

export const PATCH = POST;
