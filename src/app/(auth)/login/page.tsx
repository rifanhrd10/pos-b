import Image from "next/image";
import { redirect } from "next/navigation";
import { BayaroLogo } from "@/components/shared/logo";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-bayaro-navy lg:block">
        <Image
          src="/branding/bayaro-bg.png"
          alt="Bayaro background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#07173f]/90 via-[#135FEF]/65 to-[#07173f]/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <BayaroLogo />
          <div className="max-w-xl">
            <p className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">Bayaro POS Full Access</p>
            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Kasir modern yang ringan, cepat, dan siap dipakai bisnis kecil.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
              Satu dashboard untuk produk, kasir, transaksi, stok, modul tambahan, dan pengaturan outlet dalam satu aplikasi.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-4">
            {["UMKM", "Coffee shop kecil", "Retail starter"].map((item) => (
              <div key={item} className="rounded-3xl bg-white/10 p-4 text-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-xl rounded-[36px] bg-white p-8 shadow-soft md:p-10">
          <div className="flex justify-center lg:hidden">
            <BayaroLogo />
          </div>
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bayaro-blue">Masuk ke Bayaro</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Login admin kasir</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Gunakan akun seed: <strong>admin@bayaro.id</strong> atau <strong>kasir@bayaro.id</strong> dengan password
              <strong> password123</strong>.
            </p>
          </div>

          <form action="/api/auth/login" method="post" className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="admin@bayaro.id" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <Input name="password" type="password" placeholder="Masukkan password" required />
            </div>
            <Button type="submit" className="w-full justify-center py-3 text-base">
              Masuk ke Dashboard
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
