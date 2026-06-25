import Link from "next/link";
import { BookOpen, GraduationCap, LayoutDashboard, MessageSquare, UserRoundCheck } from "lucide-react";

export function AdminNav() {
  const items = [{ href: "/admin", label: "대시보드", icon: LayoutDashboard }, { href: "/admin/courses", label: "수업 관리", icon: BookOpen }, { href: "/admin/tutors", label: "튜터 심사", icon: UserRoundCheck }, { href: "/admin/messages", label: "문의 관리", icon: MessageSquare }];
  return <aside className="rounded-2xl bg-navy-950 p-4 text-white lg:sticky lg:top-24"><Link href="/admin" className="flex items-center gap-2 border-b border-white/10 px-3 pb-4 font-extrabold"><GraduationCap className="size-5 text-blue-300" />관리자 센터</Link><nav className="mt-3 flex gap-1 overflow-x-auto lg:block lg:space-y-1">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><Icon className="size-4" />{label}</Link>)}</nav></aside>;
}
