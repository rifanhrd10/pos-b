import Link from "next/link";
import { BayaroLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-bayaro-navy lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#07173f]/90 via-[#135FEF]/65 to-[#07173f]/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <BayaroLogo />
          <div className="max-w-xl">
            <p className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">Bergabung Sekarang</p>
            <h1 className="mt-6 text-5xl font-bold leading-tight">
              Buat akun dan mulai kelola bisnis Anda hari ini.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
              Daftar gratis dan nikmati akses penuh ke semua fitur Bayaro Admin Template, dari dashboard hingga laporan.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-4">
            {["Gratis", "Tanpa kartu kredit", "Siap pakai"].map((item) => (
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bayaro-blue">Daftar ke Bayaro</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Buat akun baru</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Lengkapi data di bawah untuk membuat akun administrator.
            </p>
          </div>

          <form action="/dashboard" method="get" className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nama Depan</label>
                <Input name="firstName" type="text" placeholder="Budi" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nama Belakang</label>
                <Input name="lastName" type="text" placeholder="Santoso" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="budi@bayaro.id" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <Input name="password" type="password" placeholder="Minimal 8 karakter" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
              <Input name="confirmPassword" type="password" placeholder="Ulangi password" />
            </div>
            <Button type="submit" className="w-full justify-center py-3 text-base">
              Buat Akun
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-bayaro-blue hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
