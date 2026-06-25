import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

const successMessages: Record<string, string> = {
  "check-email": "가입 확인 메일을 보냈어요. 이메일 인증 후 로그인해 주세요.",
  "student-demo": "학생 회원가입 데모가 완료되었습니다. 로그인 버튼을 눌러 계속하세요.",
  "tutor-demo": "튜터 지원 데모가 완료되었습니다. 로그인 버튼을 눌러 승인 대기 화면을 확인하세요.",
  "tutor-pending": "튜터 지원이 접수되었습니다. 이메일 인증 후 로그인해 주세요."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string; next?: string }> }) {
  const params = await searchParams;
  return <AuthShell eyebrow="Welcome back" title="다시 만나 반가워요" description="가입한 이메일과 비밀번호로 로그인해 주세요.">
    {params.error && <div className="mb-5"><Notice tone="error">{params.error}</Notice></div>}
    {params.success && <div className="mb-5"><Notice tone="success">{successMessages[params.success] ?? "처리되었습니다."}</Notice></div>}
    <form action={loginAction} className="space-y-5">
      <input type="hidden" name="next" value={params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard"} />
      <Field label="이메일" required><Input type="email" name="email" autoComplete="email" required placeholder="name@example.com" /></Field>
      <Field label="비밀번호" required><Input type="password" name="password" autoComplete="current-password" required placeholder="비밀번호를 입력해 주세요" /></Field>
      <Button type="submit" className="w-full">로그인</Button>
    </form>
    <div className="mt-7 border-t pt-6 text-center text-sm text-slate-500">아직 회원이 아니신가요? <Link href="/signup/student" className="font-bold text-blue-700">학생으로 가입</Link><span className="mx-2">·</span><Link href="/signup/tutor" className="font-bold text-blue-700">튜터로 지원</Link></div>
  </AuthShell>;
}
