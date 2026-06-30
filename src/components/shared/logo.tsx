import Image from "next/image";
import Link from "next/link";

export function BayaroLogo({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <Image
        src={
          compact
            ? "/branding/bayaro-app-icon-blue.png"
            : dark
              ? "/branding/bayaro-logo-transparent.png"
              : "/branding/bayaro-logo-premium-blue.png"
        }
        alt="Bayaro POS"
        width={compact ? 44 : 158}
        height={compact ? 44 : 40}
        className="h-auto"
        priority
      />
    </Link>
  );
}
