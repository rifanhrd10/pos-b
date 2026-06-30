import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "Bayaro POS",
  description: "Aplikasi kasir full-stack Bayaro dengan modul inti dan tambahan yang siap dipakai.",
  icons: {
    icon: "/branding/bayaro-app-icon-blue.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
