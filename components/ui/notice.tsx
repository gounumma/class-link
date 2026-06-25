import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" | "success" | "warning" }) {
  const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return <div className={cn(
    "flex gap-3 rounded-xl border px-4 py-3 text-sm leading-6",
    tone === "info" && "border-blue-100 bg-blue-50 text-blue-800",
    tone === "error" && "border-red-100 bg-red-50 text-red-700",
    tone === "success" && "border-emerald-100 bg-emerald-50 text-emerald-700",
    tone === "warning" && "border-amber-100 bg-amber-50 text-amber-800"
  )}><Icon className="mt-0.5 size-4 shrink-0" />{children}</div>;
}
