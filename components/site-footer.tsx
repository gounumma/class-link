import Link from "next/link";
import { GraduationCap, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return <footer className="border-t border-slate-200 bg-slate-50">
    <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
      <div>
        <div className="flex items-center gap-2 font-extrabold text-navy-950"><GraduationCap className="size-5" />클래스링크</div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">학생의 배움과 좋은 선생님의 전문성이 안전하게 만나는 맞춤 과외 플랫폼입니다.</p>
      </div>
      <div>
        <p className="text-sm font-bold text-navy-950">안내</p>
        <nav className="mt-4 grid gap-3 text-sm text-slate-500">
          <Link href="/legal/terms">이용약관</Link>
          <Link href="/legal/privacy">개인정보처리방침</Link>
          <Link href="/support">고객센터</Link>
        </nav>
      </div>
      <div>
        <p className="text-sm font-bold text-navy-950">고객센터</p>
        <div className="mt-4 space-y-3 text-sm text-slate-500">
          <p className="flex items-center gap-2"><Phone className="size-4" /><a href="tel:01058933907" className="hover:text-blue-700">010.5893.3907</a></p>
          <p className="flex items-center gap-2"><Mail className="size-4" /><a href="mailto:gounumma@naver.com" className="hover:text-blue-700">gounumma@naver.com</a></p>
          <p>평일 10:00–18:00</p>
        </div>
      </div>
    </div>
    <div className="border-t border-slate-200 py-5"><div className="container-page text-xs leading-5 text-slate-400">상호명 루트에듀 · 대표 임철희 · 사업자등록번호 130-79-00592 · 사업장 주소 문의 시 안내<br />© 2026 클래스링크. All rights reserved.</div></div>
  </footer>;
}
