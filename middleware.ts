import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("bayaro_session")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/kategori") ||
    request.nextUrl.pathname.startsWith("/produk") ||
    request.nextUrl.pathname.startsWith("/topping") ||
    request.nextUrl.pathname.startsWith("/kasir") ||
    request.nextUrl.pathname.startsWith("/transaksi") ||
    request.nextUrl.pathname.startsWith("/add-on-starter") ||
    request.nextUrl.pathname.startsWith("/outlet") ||
    request.nextUrl.pathname.startsWith("/struk") ||
    request.nextUrl.pathname.startsWith("/pengaturan") ||
    request.nextUrl.pathname.startsWith("/stok") ||
    request.nextUrl.pathname.startsWith("/supplier") ||
    request.nextUrl.pathname.startsWith("/pelanggan") ||
    request.nextUrl.pathname.startsWith("/karyawan-shift") ||
    request.nextUrl.pathname.startsWith("/role-permission") ||
    request.nextUrl.pathname.startsWith("/pembayaran") ||
    request.nextUrl.pathname.startsWith("/laporan");

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
