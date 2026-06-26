import { MessageCircle, Search, ShieldCheck, UserRoundCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [profile, params] = await Promise.all([requireUser(), searchParams]);

  return <div className="bg-slate-50/70 py-14"><div className="container-page">
    {params.error === "forbidden" && <div className="mb-6"><Notice tone="error">해당 페이지에 접근할 권한이 없습니다.</Notice></div>}
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Badge tone={profile.role === "ADMIN" ? "blue" : "green"}>{profile.role === "ADMIN" ? "관리자" : "학생"}</Badge><h1 className="mt-3 text-3xl font-black">{profile.name}님, 안녕하세요</h1><p className="mt-2 text-slate-500">오늘도 좋은 배움의 연결을 시작해 볼까요?</p></div><form action={logoutAction}><Button type="submit" variant="outline" size="sm">로그아웃</Button></form></div>
    <div className="mt-10 grid gap-5 md:grid-cols-3">{[
      { icon: Search, title: "수업 둘러보기", text: "나에게 맞는 과목과 수업을 찾아보세요.", href: "/courses", cta: "수업 찾기" },
      { icon: MessageCircle, title: "문의 메시지", text: "관리자와 나눈 상담을 이어갈 수 있어요.", href: "/messages", cta: "메시지 보기" },
      profile.role === "ADMIN" ? { icon: ShieldCheck, title: "관리자 센터", text: "수업과 상담 문의를 관리하세요.", href: "/admin", cta: "관리 시작" } : { icon: UserRoundCheck, title: "안심 이용", text: "개인정보는 역할별 권한에 따라 보호됩니다.", href: "/legal/privacy", cta: "보호 정책 보기" }
    ].map(({ icon: Icon, title, text, href, cta }) => <div key={title} className="rounded-2xl border bg-white p-6 shadow-soft"><div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="size-5" /></div><h2 className="mt-5 text-lg font-extrabold">{title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{text}</p><LinkButton href={href} variant="outline" size="sm" className="mt-5">{cta}</LinkButton></div>)}</div>
  </div></div>;
}
