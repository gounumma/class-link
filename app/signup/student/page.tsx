import { studentSignupAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { ConsentFields } from "@/components/consent-fields";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export default async function StudentSignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AuthShell eyebrow="Student sign up" title="학생 회원가입" description="수업을 둘러보고 관리자와 안전하게 상담해 보세요.">
    {params.error && <div className="mb-5"><Notice tone="error">{params.error}</Notice></div>}
    <form action={studentSignupAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2"><Field label="이름" required><Input name="name" required autoComplete="name" placeholder="홍길동" /></Field><Field label="휴대전화" required><Input name="phone" required inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" /></Field></div>
      <Field label="이메일" required><Input type="email" name="email" required autoComplete="email" placeholder="name@example.com" /></Field>
      <Field label="비밀번호" required hint="영문, 숫자를 조합해 8자 이상 입력해 주세요."><Input type="password" name="password" required minLength={8} autoComplete="new-password" /></Field>
      <ConsentFields />
      <Button type="submit" className="w-full">학생으로 가입하기</Button>
    </form>
  </AuthShell>;
}
