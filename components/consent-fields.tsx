import Link from "next/link";

export function ConsentFields() {
  return <fieldset className="rounded-2xl bg-slate-50 p-5"><legend className="mb-3 text-sm font-bold text-navy-950">약관 동의</legend><div className="space-y-3 text-sm text-slate-600">
    <label className="flex items-start gap-2"><input type="checkbox" name="terms" required className="mt-1 accent-blue-600" /><span>[필수] <Link href="/legal/terms" target="_blank" className="underline">이용약관</Link>에 동의합니다.</span></label>
    <label className="flex items-start gap-2"><input type="checkbox" name="privacy" required className="mt-1 accent-blue-600" /><span>[필수] <Link href="/legal/privacy" target="_blank" className="underline">개인정보처리방침</Link>에 동의합니다.</span></label>
    <label className="flex items-start gap-2"><input type="checkbox" name="marketing" className="mt-1 accent-blue-600" /><span>[선택] 수업 소식 및 혜택 안내 수신에 동의합니다.</span></label>
  </div></fieldset>;
}
