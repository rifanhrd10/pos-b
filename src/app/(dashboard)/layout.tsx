import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell userName="Admin Bayaro" outletName="Bayaro HQ">
      {children}
    </DashboardShell>
  );
}
