import Link from "next/link";
import { ArrowUpRight, CalendarDays, Edit3 } from "lucide-react";
import type { Course } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";

const palettes: Record<string, string> = {
  "수학": "from-blue-100 via-indigo-50 to-slate-100",
  "영어": "from-cyan-100 via-blue-50 to-indigo-100",
  "국어": "from-rose-100 via-orange-50 to-amber-100"
};

export function CourseCard({ course, canManage = false }: { course: Course; canManage?: boolean }) {
  const gradient = palettes[course.subject ?? ""] ?? "from-emerald-100 via-teal-50 to-blue-100";
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-card">
    <Link href={`/courses/${course.id}`} className="group focus-ring block">
      <div className={`relative h-44 bg-gradient-to-br bg-cover bg-center ${gradient} p-6`} style={course.image_url ? { backgroundImage: `linear-gradient(rgba(255,255,255,.2),rgba(255,255,255,.35)),url(${course.image_url})` } : undefined}>
        <div className="absolute -right-7 -top-8 size-32 rounded-full border-[18px] border-white/40" />
        <div className="absolute bottom-5 right-6 grid size-12 place-items-center rounded-2xl bg-white/70 text-2xl font-black text-navy-900 shadow-sm backdrop-blur">{course.subject?.slice(0, 1) ?? "수"}</div>
        <Badge className="relative bg-white/80 text-navy-900">{course.subject ?? "맞춤 수업"}</Badge>
        <p className="relative mt-12 text-sm font-semibold text-slate-600">{course.grade_level}</p>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-extrabold leading-8 group-hover:text-blue-700">{course.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{course.short_description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-4" />{course.schedule_text?.split("·")[0]}</span>
          <ArrowUpRight className="size-5 text-slate-400 transition group-hover:text-blue-600" />
        </div>
      </div>
    </Link>
    {canManage && <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
      <LinkButton href={`/admin/courses/${course.id}/edit`} variant="outline" size="sm" className="w-full">
        <Edit3 className="mr-2 size-4" />수업 수정
      </LinkButton>
    </div>}
  </article>;
}
