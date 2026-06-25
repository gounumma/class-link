import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getCourses } from "@/lib/data";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/field";

export const metadata: Metadata = { title: "수업 찾기" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string }> }) {
  const params = await searchParams;
  const [allCourses, profile] = await Promise.all([getCourses(), getCurrentProfile()]);
  const canManageCourses = profile?.role === "ADMIN";
  const courses = allCourses.filter((course) => (!params.q || `${course.title} ${course.short_description}`.includes(params.q)) && (!params.subject || course.subject === params.subject));
  const subjects = [...new Set(allCourses.map((course) => course.subject).filter(Boolean))];
  return <div className="bg-slate-50/70 py-14 sm:py-20"><div className="container-page">
    <div className="max-w-2xl"><p className="text-sm font-bold text-blue-600">CLASS COLLECTION</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">학생의 가능성을 여는 수업</h1><p className="mt-4 leading-7 text-slate-500">현재 수준과 목표에 맞는 수업을 살펴보고, 궁금한 점은 관리자에게 바로 문의해 보세요.</p></div>
    <form className="mt-10 flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-soft sm:flex-row">
      <div className="relative flex-1"><Search className="absolute left-4 top-4 size-4 text-slate-400" /><Input name="q" defaultValue={params.q} placeholder="과목이나 수업명으로 검색" className="border-0 pl-11 focus:ring-0" /></div>
      <select name="subject" defaultValue={params.subject ?? ""} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 sm:w-44"><option value="">전체 과목</option>{subjects.map((subject) => <option key={subject} value={subject!}>{subject}</option>)}</select>
      <button className="rounded-xl bg-navy-900 px-6 text-sm font-bold text-white">검색</button>
    </form>
    <div className="mt-8 flex items-center justify-between"><p className="text-sm text-slate-500"><b className="text-navy-950">{courses.length}</b>개의 수업</p></div>
    {courses.length ? <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} canManage={canManageCourses} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed bg-white py-20 text-center text-slate-500">조건에 맞는 수업이 없어요.</div>}
  </div></div>;
}
