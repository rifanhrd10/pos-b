import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isForm = contentType.includes("form");
  const raw = isForm ? Object.fromEntries((await request.formData()).entries()) : await request.json();
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return isForm
      ? NextResponse.redirect(new URL("/login?error=validation", request.url))
      : NextResponse.json({ message: parsed.error.issues[0]?.message || "Input login tidak valid." }, { status: 400 });
  }

  const session = await authenticate(parsed.data.email, parsed.data.password);
  if (!session) {
    return isForm
      ? NextResponse.redirect(new URL("/login?error=credentials", request.url))
      : NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
  }

  await createSession(session);

  return isForm
    ? NextResponse.redirect(new URL("/dashboard", request.url))
    : NextResponse.json({ message: "Login berhasil.", user: session });
}
