import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children, asideTitle = "안전한 배움의 연결", asideText = "인증된 계정과 안전한 상담 공간으로 학생과 선생님 모두 안심할 수 있어요." }: { eyebrow: string; title: string; description: string; children: React.ReactNode; asideTitle?: string; asideText?: string }) {
  return <div className="bg-slate-50/70 py-12 sm:py-20"><div className="container-page grid max-w-5xl overflow-hidden rounded-3xl border bg-white p-0 shadow-card lg:grid-cols-[1fr_340px]">
    <div className="p-6 sm:p-10 lg:p-12"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-navy-950"><GraduationCap className="size-5" />클래스링크</Link><p className="mt-10 text-xs font-bold uppercase tracking-widest text-blue-600">{eyebrow}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p><div className="mt-8">{children}</div></div>
    <aside className="relative hidden overflow-hidden bg-navy-950 p-10 text-white lg:block"><div className="absolute -right-16 -top-16 size-52 rounded-full border-[35px] border-blue-500/20" /><div className="relative flex h-full flex-col justify-between"><ShieldCheck className="size-10 text-blue-300" /><div><h2 className="text-2xl font-black text-white">{asideTitle}</h2><p className="mt-4 text-sm leading-7 text-slate-300">{asideText}</p><div className="mt-8 space-y-3 text-sm text-slate-200"><p>✓ 관리자 중심의 상담</p><p>✓ 민감 서류 비공개 보관</p><p>✓ 역할별 접근 권한 보호</p></div></div></div></aside>
  </div></div>;
}
