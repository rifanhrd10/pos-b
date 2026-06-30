import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSession();
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("form")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.json({ message: "Logout berhasil." });
}
