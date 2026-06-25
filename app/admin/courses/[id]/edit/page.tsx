import { notFound } from "next/navigation";
import { getCourse } from "@/lib/data";
import { CourseForm } from "@/components/course-form";

export default async function EditCoursePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const course = await getCourse(id, true);
  if (!course) notFound();
  return <><div className="mb-7"><p className="text-sm font-bold text-blue-600">EDIT COURSE</p><h1 className="mt-2 text-3xl font-black">수업 수정</h1><p className="mt-2 text-sm text-slate-500">{course.title}</p></div><CourseForm course={course} error={query.error} /></>;
}
