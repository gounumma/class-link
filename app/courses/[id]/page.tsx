import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, Check, Edit3, MessageCircle, ShieldCheck, WalletCards } from "lucide-react";
import { getCourse } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { startChatAction } from "@/app/actions/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Notice } from "@/components/ui/notice";
import { Textarea } from "@/components/ui/field";

export default async function CourseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [course, profile] = await Promise.all([getCourse(id), getCurrentProfile()]);
  if (!course) notFound();
  const canChat = profile && (profile.role !== "TUTOR" || profile.tutor_status === "APPROVED");
  const canManageCourse = profile?.role === "ADMIN";
  return <div className="bg-slate-50/70 pb-20">
    <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white"><div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_360px] lg:py-20"><div><Badge className="bg-white/10 text-blue-100">{course.subject}</Badge><h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">{course.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{course.short_description}</p><div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-200"><span className="flex items-center gap-2"><BookOpen className="size-4 text-blue-300" />{course.grade_level}</span><span className="flex items-center gap-2"><CalendarDays className="size-4 text-blue-300" />{course.schedule_text}</span></div>{canManageCourse && <div className="mt-8"><LinkButton href={`/admin/courses/${course.id}/edit`} variant="secondary"><Edit3 className="mr-2 size-4" />이 수업 수정하기</LinkButton></div>}</div><div className="hidden rounded-3xl bg-white/8 p-7 backdrop-blur lg:block"><ShieldCheck className="size-9 text-blue-300" /><p className="mt-5 text-xl font-bold">안심 상담</p><p className="mt-2 text-sm leading-6 text-slate-300">개인 연락처를 공개하지 않고 클래스링크 관리자와 수업에 관해 상담할 수 있어요.</p></div></div></div>
    <div className="container-page mt-10 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <article className="rounded-2xl border bg-white p-6 shadow-soft sm:p-9"><h2 className="text-2xl font-black">수업 소개</h2><div className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-600">{course.full_description}</div><div className="mt-9 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-blue-50 p-5"><CalendarDays className="size-5 text-blue-700" /><p className="mt-3 text-xs font-bold text-blue-700">수업 일정</p><p className="mt-1 font-semibold text-navy-950">{course.schedule_text}</p></div><div className="rounded-2xl bg-emerald-50 p-5"><WalletCards className="size-5 text-emerald-700" /><p className="mt-3 text-xs font-bold text-emerald-700">수업료</p><p className="mt-1 font-semibold text-navy-950">{course.price_text}</p></div></div><div className="mt-9 border-t pt-8"><h3 className="text-lg font-extrabold">이런 학생에게 추천해요</h3><ul className="mt-4 space-y-3 text-sm text-slate-600">{["현재 실력을 정확히 진단하고 싶은 학생", "개념과 문제 해결력을 함께 키우고 싶은 학생", "꾸준한 학습 관리가 필요한 학생"].map((text) => <li key={text} className="flex gap-2"><Check className="mt-0.5 size-4 text-blue-600" />{text}</li>)}</ul></div></article>
      <aside className="sticky top-28 rounded-2xl border bg-white p-6 shadow-card">{canManageCourse && <div className="mb-5 rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-700">관리자 작업</p><LinkButton href={`/admin/courses/${course.id}/edit`} variant="outline" size="sm" className="mt-3 w-full"><Edit3 className="mr-2 size-4" />수업 내용 수정</LinkButton></div>}<p className="text-sm font-bold text-blue-600">수업이 궁금하신가요?</p><h2 className="mt-2 text-2xl font-black">관리자에게 문의하기</h2><p className="mt-3 text-sm leading-6 text-slate-500">수업 가능 시간, 진행 방식 등 궁금한 점을 남겨 주세요.</p>{query.error && <div className="mt-4"><Notice tone="error">{query.error}</Notice></div>}{canChat ? <form action={startChatAction.bind(null, course.id)} className="mt-5"><Textarea name="body" required maxLength={1000} placeholder="예: 현재 중2이고, 선행과 복습을 함께 진행하고 싶어요." className="min-h-32" /><Button className="mt-3 w-full" type="submit"><MessageCircle className="mr-2 size-4" />문의 보내기</Button></form> : <div className="mt-5"><LinkButton href={profile ? "/dashboard" : `/login?next=/courses/${course.id}`} className="w-full">{profile ? "승인 상태 확인하기" : "로그인하고 문의하기"}</LinkButton></div>}<div className="mt-5 flex gap-2 border-t pt-5 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" />문의 내용은 본인과 관리자만 확인할 수 있습니다.</div></aside>
    </div>
  </div>;
}
