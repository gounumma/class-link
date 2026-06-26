import Link from "next/link";
import { GraduationCap, Menu, MessageCircle } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { LinkButton } from "@/components/ui/link-button";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  return <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
    <div className="container-page flex h-18 items-center justify-between gap-4">
      <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg" aria-label="클래스모아 홈">
        <span className="grid size-9 place-items-center rounded-xl bg-navy-900 text-white"><GraduationCap className="size-5" /></span>
        <span className="text-lg font-extrabold tracking-tight text-navy-950">클래스모아</span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="주 메뉴">
        <Link className="hover:text-blue-700" href="/courses">수업 찾기</Link>
        <Link className="hover:text-blue-700" href="/#process">수업 진행 방식</Link>
        <Link className="hover:text-blue-700" href="/#trust">클래스모아 소개</Link>
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {profile ? <>
          <LinkButton href="/messages" variant="ghost" size="sm"><MessageCircle className="mr-1.5 size-4" />메시지</LinkButton>
          <LinkButton href={profile.role === "ADMIN" ? "/admin" : "/dashboard"} size="sm">{profile.name}님</LinkButton>
        </> : <>
          <LinkButton href="/login" variant="ghost" size="sm">로그인</LinkButton>
          <LinkButton href="/signup/student" size="sm">무료로 시작하기</LinkButton>
        </>}
      </div>
      <details className="group relative md:hidden">
        <summary className="focus-ring grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 [&::-webkit-details-marker]:hidden" aria-label="메뉴 열기"><Menu className="size-5" /></summary>
        <nav className="absolute right-0 top-12 z-50 grid w-52 gap-1 rounded-2xl border bg-white p-2 text-sm font-semibold shadow-card">
          <Link className="rounded-xl px-4 py-3 hover:bg-slate-50" href="/courses">수업 찾기</Link>
          <Link className="rounded-xl px-4 py-3 hover:bg-slate-50" href="/messages">문의 메시지</Link>
          <Link className="rounded-xl px-4 py-3 hover:bg-slate-50" href={profile?.role === "ADMIN" ? "/admin" : profile ? "/dashboard" : "/login"}>{profile ? "마이페이지" : "로그인"}</Link>
        </nav>
      </details>
    </div>
  </header>;
}
