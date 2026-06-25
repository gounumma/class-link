import { Edit3, Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { getCourses } from "@/lib/data";
import { deleteCourseAction, toggleCoursePublishedAction } from "@/app/actions/admin";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [courses, params] = await Promise.all([getCourses(true), searchParams]);
  const success = params.success === "deleted"
    ? "수업을 삭제했습니다."
    : params.success === "published"
      ? "수업을 공개 상태로 변경했습니다."
      : params.success === "unpublished"
        ? "수업을 비공개 상태로 변경했습니다."
    : params.success === "demo-saved"
      ? "수업을 저장했습니다. 홈 추천 영역에서 바로 확인할 수 있어요."
      : params.success ? "수업 정보를 저장했습니다." : null;
  const error = params.error === "status" ? "수업 공개 상태를 변경하지 못했어요. 잠시 후 다시 시도해 주세요." : null;

  return <>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-bold text-blue-600">COURSES</p><h1 className="mt-2 text-3xl font-black">수업 관리</h1><p className="mt-2 text-sm text-slate-500">수업을 등록하고 홈 추천 여부와 공개 순서를 관리하세요.</p></div>
      <LinkButton href="/admin/courses/new?featured=1"><Plus className="mr-2 size-4" />내 수업 추가</LinkButton>
    </div>
    {success && <div className="mt-6"><Notice tone="success">{success}</Notice></div>}
    {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}
    <div className="mt-7 overflow-hidden rounded-2xl border bg-white shadow-soft">
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">수업</th><th className="px-5 py-4">과목 / 학년</th><th className="px-5 py-4">상태</th><th className="px-5 py-4">순서</th><th className="px-5 py-4 text-right">관리</th></tr></thead>
        <tbody className="divide-y">{courses.map((course) => <tr key={course.id} className="hover:bg-slate-50/60">
          <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-2"><LinkButton href={`/admin/courses/${course.id}/edit`} variant="ghost" size="sm" className="-ml-3 h-auto px-3 py-1 text-left text-base font-extrabold text-navy-950 hover:text-blue-700">{course.title}</LinkButton>{course.is_featured && <Badge tone="amber"><Star className="mr-1 size-3" />홈 추천</Badge>}</div><p className="mt-1 max-w-xs truncate text-xs text-slate-400">{course.short_description}</p></td>
          <td className="px-5 py-4 text-slate-500">{course.subject}<br /><span className="text-xs">{course.grade_level}</span></td>
          <td className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={course.is_published ? "green" : "slate"}>{course.is_published ? <><Eye className="mr-1 size-3" />공개</> : <><EyeOff className="mr-1 size-3" />비공개</>}</Badge>
              <form action={toggleCoursePublishedAction.bind(null, course.id, !course.is_published)}>
                <Button type="submit" variant="outline" size="sm">
                  {course.is_published ? "비공개로 전환" : "공개로 전환"}
                </Button>
              </form>
            </div>
          </td>
          <td className="px-5 py-4 text-slate-500">{course.sort_order}</td>
          <td className="px-5 py-4"><div className="flex justify-end gap-2"><LinkButton href={`/admin/courses/${course.id}/edit`} variant="outline" size="sm"><Edit3 className="mr-1.5 size-4" />수정</LinkButton><form action={deleteCourseAction.bind(null, course.id)}><Button type="submit" variant="danger" size="sm"><Trash2 className="size-4" /><span className="sr-only">삭제</span></Button></form></div></td>
        </tr>)}</tbody>
      </table></div>
      {!courses.length && <div className="py-20 text-center text-sm text-slate-400">등록된 수업이 없습니다.</div>}
    </div>
  </>;
}
