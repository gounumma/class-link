import type { Course } from "@/lib/types";
import { saveCourseAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasteableTextarea } from "@/components/ui/pasteable-textarea";

export function CourseForm({ course, error, defaultFeatured = false }: { course?: Course | null; error?: string; defaultFeatured?: boolean }) {
  return <form action={saveCourseAction.bind(null, course?.id ?? null)} className="rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
    {error && <div className="mb-6"><Notice tone="error">{error}</Notice></div>}
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="수업명" required><Input name="title" required defaultValue={course?.title ?? ""} /></Field></div>
      <Field label="과목"><Input name="subject" defaultValue={course?.subject ?? ""} placeholder="예: 수학" /></Field>
      <Field label="학년"><Input name="grade_level" defaultValue={course?.grade_level ?? ""} placeholder="예: 중1–중3" /></Field>
      <div className="sm:col-span-2"><Field label="짧은 소개" hint="홈과 전체 수업의 카드에 표시됩니다."><PasteableTextarea name="short_description" maxLength={200} defaultValue={course?.short_description ?? ""} className="min-h-24" /></Field></div>
      <div className="sm:col-span-2"><Field label="상세 소개"><PasteableTextarea name="full_description" maxLength={10000} defaultValue={course?.full_description ?? ""} className="min-h-56" /></Field></div>
      <Field label="일정 안내"><Input name="schedule_text" defaultValue={course?.schedule_text ?? ""} placeholder="주 2회 · 회당 90분" /></Field>
      <Field label="수업료 안내"><Input name="price_text" defaultValue={course?.price_text ?? ""} placeholder="월 480,000원" /></Field>
      <div className="sm:col-span-2"><Field label="대표 이미지 URL"><Input type="url" name="image_url" defaultValue={course?.image_url ?? ""} placeholder="https://..." /></Field></div>
      <Field label="정렬 순서" hint="숫자가 작을수록 홈에서 먼저 표시됩니다."><Input type="number" name="sort_order" min={0} max={9999} defaultValue={course?.sort_order ?? 0} /></Field>
      <div className="grid gap-3">
        <label className="flex min-h-12 items-center gap-3 rounded-xl bg-blue-50 px-4 text-sm font-semibold text-blue-900"><input type="checkbox" name="is_published" defaultChecked={course?.is_published ?? defaultFeatured} className="size-4 accent-blue-600" />전체 수업 목록에 공개</label>
        <label className="flex min-h-12 items-center gap-3 rounded-xl bg-amber-50 px-4 text-sm font-semibold text-amber-900"><input type="checkbox" name="is_featured" defaultChecked={course?.is_featured ?? defaultFeatured} className="size-4 accent-amber-600" />홈 ‘지금 만나볼 수 있는 수업’에 노출</label>
      </div>
    </div>
    <div className="mt-8 flex justify-end"><Button type="submit">{course ? "변경 사항 저장" : "수업 등록하고 노출하기"}</Button></div>
  </form>;
}
