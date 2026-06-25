import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { tutorSignupAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { ConsentFields } from "@/components/consent-fields";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export default async function TutorSignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AuthShell eyebrow="Tutor application" title="튜터 지원하기" description="학생의 성장을 함께할 선생님을 기다립니다." asideTitle="서류는 안전하게 보관해요" asideText="증명서는 비공개 저장소에 암호화 전송되며, 관리자만 1분 동안 유효한 임시 링크로 확인할 수 있습니다.">
    {params.error && <div className="mb-5"><Notice tone="error">{params.error}</Notice></div>}
    <form action={tutorSignupAction} className="space-y-7">
      <section><h2 className="mb-5 text-lg font-extrabold">기본 정보</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="이름" required><Input name="name" required autoComplete="name" /></Field><Field label="휴대전화" required><Input name="phone" required inputMode="tel" placeholder="010-1234-5678" /></Field></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="이메일" required><Input type="email" name="email" required autoComplete="email" /></Field><Field label="비밀번호" required><Input type="password" name="password" required minLength={8} autoComplete="new-password" /></Field></div></section>
      <section className="border-t pt-7"><h2 className="mb-5 text-lg font-extrabold">학력 및 경력</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="학교명" required><Input name="school_name" required /></Field><Field label="전공"><Input name="major" /></Field></div><div className="mt-5"><Field label="학적 상태" required><Select name="education_status" required><option value="ENROLLED">재학</option><option value="GRADUATED">졸업</option></Select></Field></div><div className="mt-5"><Field label="경력 소개" hint="수업·강의 경력을 구체적으로 작성해 주세요."><Textarea name="career" maxLength={2000} /></Field></div><div className="mt-5"><Field label="자기소개" required hint="수업 철학, 주요 과목, 학생과 소통하는 방식을 알려 주세요."><Textarea name="bio" required minLength={20} maxLength={3000} className="min-h-40" /></Field></div></section>
      <section className="border-t pt-7"><h2 className="mb-5 text-lg font-extrabold">학력 증빙</h2><Field label="재학 또는 졸업 증명서" required hint="PDF, JPG, JPEG, PNG · 최대 10MB"><div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center hover:border-blue-300"><FileCheck2 className="mx-auto size-8 text-blue-600" /><p className="mt-3 text-sm font-semibold text-navy-950">파일을 선택해 주세요</p><input type="file" name="certificate" required accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="mt-4 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-blue-700" /></div></Field><div className="mt-4"><Notice tone="warning">주민등록번호와 뒷자리가 포함된 개인정보는 반드시 가리고 업로드해 주세요. 주민등록번호는 수집하지 않습니다.</Notice></div><p className="mt-3 text-xs leading-5 text-slate-500">제출 전 <Link href="/legal/tutor-verification" target="_blank" className="underline">튜터 검증 및 증명서 처리 안내</Link>를 확인해 주세요.</p></section>
      <ConsentFields />
      <Button type="submit" className="w-full">지원서 제출하기</Button>
    </form>
  </AuthShell>;
}
