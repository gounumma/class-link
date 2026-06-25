import { CourseForm } from "@/components/course-form";

export default async function NewCoursePage({ searchParams }: { searchParams: Promise<{ error?: string; featured?: string }> }) {
  const params = await searchParams;
  return <><div className="mb-7"><p className="text-sm font-bold text-blue-600">NEW COURSE</p><h1 className="mt-2 text-3xl font-black">맞춤형 수업 프로그램 등록</h1><p className="mt-2 text-sm text-slate-500">수업 내용을 작성하고 홈 추천 여부를 선택하세요.</p></div><CourseForm error={params.error} defaultFeatured={params.featured === "1"} /></>;
}
