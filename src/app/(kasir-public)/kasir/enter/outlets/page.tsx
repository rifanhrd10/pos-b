import { getPublicOutlets } from "@/actions/kasir-public";
import { OutletGrid } from "./outlet-grid";

export const dynamic = "force-dynamic";

export default async function KasirEnterOutletsPage() {
  const outlets = await getPublicOutlets();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-50 font-['Sora',sans-serif]">
            Pilih Outlet
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pilih outlet tempat Anda bertugas, lalu masukkan PIN
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {outlets.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <span className="material-symbols-outlined text-slate-600 text-5xl">
                  storefront
                </span>
                <p className="text-slate-400 mt-4">
                  Tidak ada outlet aktif yang tersedia
                </p>
              </div>
            </div>
          ) : (
            <OutletGrid outlets={outlets} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto text-center">
          <a
            href="/login"
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            Masuk sebagai Owner / Manager
          </a>
        </div>
      </footer>
    </div>
  );
}
