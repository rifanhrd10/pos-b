export const dynamic = "force-dynamic";

export default function KasirPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 antialiased">
      {children}
    </div>
  );
}
