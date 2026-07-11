import { getPublicOutlets } from "@/actions/kasir-public";
import { OutletGrid } from "./outlet-grid";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ businessId?: string }>;
}

export default async function KasirEnterOutletsPage({ searchParams }: Props) {
  const { businessId } = await searchParams;

  // Redirect to store code entry if no businessId provided
  if (!businessId) {
    redirect("/kasir/enter");
  }

  const outlets = await getPublicOutlets(businessId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Pilih Outlet
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Pilih outlet tempat Anda bertugas, lalu masukkan PIN
            </p>
          </div>
          <a
            href="/kasir/enter"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all"
          >
            Ganti Toko
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {outlets.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏪</span>
                </div>
                <p className="text-slate-500 font-medium">
                  Tidak ada outlet aktif yang tersedia
                </p>
                <a
                  href="/kasir/enter"
                  className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline"
                >
                  Kembali ke input kode toko
                </a>
              </div>
            </div>
          ) : (
            <OutletGrid outlets={outlets} businessId={businessId} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto text-center">
          <a
            href="/login"
            className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            Masuk sebagai Owner / Manager
          </a>
        </div>
      </footer>
    </div>
  );
}
