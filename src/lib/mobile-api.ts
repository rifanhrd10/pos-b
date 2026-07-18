import { NextResponse } from "next/server";

export class MobileApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function apiError(error: unknown) {
  if (error instanceof MobileApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  console.error("Mobile API error", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server" } },
    { status: 500, headers: { "Cache-Control": "no-store" } }
  );
}

export function noStoreJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
