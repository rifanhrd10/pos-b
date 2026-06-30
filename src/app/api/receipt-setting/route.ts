import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { receiptSchema } from "@/lib/validations";

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("form")) {
    const data = Object.fromEntries((await request.formData()).entries());
    return {
      ...data,
      showLogo: data.showLogo === "on",
      showCashierName: data.showCashierName === "on",
      showCustomerName: data.showCustomerName === "on",
      showTax: data.showTax === "on",
      showServiceCharge: data.showServiceCharge === "on",
    };
  }
  return request.json();
}

function expectsJson(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";
  return contentType.includes("application/json") || accept.includes("application/json");
}

export async function GET() {
  const receipt = await prisma.receiptSetting.findFirst();
  return NextResponse.json(receipt);
}

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const parsed = receiptSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Input struk tidak valid." }, { status: 400 });
  }

  const outlet = await prisma.outlet.findFirstOrThrow({ where: { deletedAt: null } });
  const receipt = await prisma.receiptSetting.upsert({
    where: { outletId: outlet.id },
    update: {
      ...parsed.data,
    },
    create: {
      outletId: outlet.id,
      ...parsed.data,
    },
  });

  if (expectsJson(request)) {
    return NextResponse.json({ message: "Template struk berhasil disimpan.", receipt });
  }

  return NextResponse.redirect(new URL("/struk", request.url));
}

export const PATCH = POST;
