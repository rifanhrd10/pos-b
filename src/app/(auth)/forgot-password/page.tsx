import Link from "next/link";
import { BayaroLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bayaro-soft p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <BayaroLogo />
        </div>

        <div className="mt-8 rounded-[36px] bg-white p-8 shadow-soft">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Lupa password?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mereset password Anda.
            </p>
          </div>

          <form action="/login" method="get" className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" placeholder="admin@bayaro.id" />
            </div>
            <Button type="submit" className="w-full justify-center py-3 text-base">
              Kirim Link Reset
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ingat password Anda?{" "}
            <Link href="/login" className="font-medium text-bayaro-blue hover:underline">
              Kembali ke login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
