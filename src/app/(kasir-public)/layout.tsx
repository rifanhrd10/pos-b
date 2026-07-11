export const dynamic = "force-dynamic";

export default function KasirPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {children}
    </div>
  );
}
