import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="bg-slate-50/70 py-8 sm:py-12"><div className="container-page grid gap-7 lg:grid-cols-[220px_1fr]"><AdminNav /><div className="min-w-0">{children}</div></div></div>;
}
