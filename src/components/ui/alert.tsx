import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

type AlertTone = "info" | "success" | "warning" | "danger";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
};

const styles: Record<AlertTone, string> = {
  info: "bg-cyan-50 border-cyan-200 text-cyan-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  danger: "bg-rose-50 border-rose-200 text-rose-800",
};

const iconStyles: Record<AlertTone, string> = {
  info: "text-cyan-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-rose-500",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[tone];
  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4", styles[tone], className)}>
      <Icon size={18} className={cn("mt-0.5 shrink-0", iconStyles[tone])} />
      <div className="text-sm">
        {title && <p className="font-semibold">{title}</p>}
        <p className={cn(title && "mt-1 opacity-80")}>{children}</p>
      </div>
    </div>
  );
}
