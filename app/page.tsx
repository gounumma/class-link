import { ArrowRight, BadgeCheck, BookOpenCheck, HeartHandshake, MessageCircle, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { getFeaturedCourses } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { CourseCard } from "@/components/course-card";
import { LinkButton } from "@/components/ui/link-button";

export default async function HomePage() {
  const [courses, profile] = await Promise.all([getFeaturedCourses(), getCurrentProfile()]);
  return <>
    <section className="relative overflow-hidden bg-gradient-to-b from-skysoft to-white">
      <div className="subtle-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm"><Sparkles className="size-3.5" />아이에게 꼭 맞는 배움의 시작</div>
          <h1 className="mt-6 text-[34px] font-black leading-[1.2] sm:text-5xl lg:text-[62px]">좋은 선생님과 만나는<br /><span className="text-blue-600">가장 믿음직한 방법</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">수업 선택부터 상담까지, 클래스링크가 꼼꼼하게 연결합니다. 학생의 목표에 집중한 1:1 학습 설계를 만나보세요.</p>
          <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/courses" size="lg">수업 둘러보기<ArrowRight className="ml-2 size-4" /></LinkButton><LinkButton href="/signup/tutor" variant="outline" size="lg">튜터로 지원하기</LinkButton></div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500"><span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-blue-600" />신원·학력 서류 확인</span><span className="flex items-center gap-1.5"><MessageCircle className="size-4 text-blue-600" />관리자 직접 상담</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -left-8 top-20 size-32 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="relative rotate-2 rounded-3xl bg-navy-900 p-3 shadow-[0_30px_80px_rgba(16,32,68,.25)]">
            <div className="overflow-hidden rounded-[1.35rem] bg-white">
              <div className="flex items-center justify-between border-b p-5"><div><p className="text-xs font-bold text-blue-600">이번 주 학습 리포트</p><p className="mt-1 font-extrabold text-navy-950">민준 학생의 수학 성장 기록</p></div><div className="grid size-10 place-items-center rounded-xl bg-blue-50"><BookOpenCheck className="size-5 text-blue-700" /></div></div>
              <div className="space-y-5 p-6">
                <div className="rounded-2xl bg-slate-50 p-5"><div className="flex justify-between text-xs font-semibold text-slate-500"><span>개념 이해도</span><span className="text-blue-700">86%</span></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 w-[86%] rounded-full bg-blue-600" /></div></div>
                <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">완료한 문제</p><p className="mt-1 text-2xl font-black text-navy-950">42<span className="text-sm font-medium text-slate-400">개</span></p></div><div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">연속 학습</p><p className="mt-1 text-2xl font-black text-navy-950">4<span className="text-sm font-medium text-slate-400">주</span></p></div></div>
                <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-blue-600" /><p><b>선생님 코멘트</b><br />연립방정식 응용 문제에서 풀이 과정이 훨씬 탄탄해졌어요.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="trust" className="container-page py-20">
      <div className="text-center"><p className="text-sm font-bold text-blue-600">WHY CLASSLINK</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">배움에만 집중할 수 있도록</h2><p className="mx-auto mt-4 max-w-2xl text-slate-500">선생님 검증부터 상담과 학습 연결까지, 중요한 과정은 클래스링크가 함께합니다.</p></div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[{ icon: ShieldCheck, title: "꼼꼼한 튜터 검증", text: "학력 증빙과 기본 정보를 관리자가 직접 확인하고 승인합니다." }, { icon: HeartHandshake, title: "목표 중심의 매칭", text: "학생의 현재 수준과 목표를 듣고 알맞은 수업을 함께 찾아갑니다." }, { icon: MessageCircle, title: "안전한 1:1 상담", text: "개인 연락처 노출 없이 플랫폼 안에서 관리자에게 편하게 문의하세요." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border bg-white p-7 shadow-soft"><div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon /></div><h3 className="mt-5 text-xl font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}
      </div>
    </section>

    <section className="bg-slate-50 py-20">
      <div className="container-page"><div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-sm font-bold text-blue-600">추천 수업</p><h2 className="mt-2 text-3xl font-black">지금 만나볼 수 있는 수업</h2></div><div className="flex gap-2">{profile?.role === "ADMIN" && <LinkButton href="/admin/courses/new?featured=1" size="sm"><Plus className="mr-1.5 size-4" />내 수업 추가</LinkButton>}<LinkButton href="/courses" variant="ghost" size="sm">전체 보기<ArrowRight className="ml-2 size-4" /></LinkButton></div></div>{courses.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <div className="mt-10 rounded-2xl border border-dashed bg-white py-16 text-center"><p className="text-sm text-slate-500">홈에 노출할 수업을 등록해 주세요.</p>{profile?.role === "ADMIN" && <LinkButton href="/admin/courses/new?featured=1" className="mt-4" size="sm">첫 수업 등록하기</LinkButton>}</div>}</div>
    </section>

    <section id="process" className="container-page py-20"><div className="rounded-3xl bg-navy-950 px-6 py-12 text-white sm:px-12"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold text-blue-300">간단한 시작</p><h2 className="mt-3 text-3xl font-black text-white">세 단계면 충분해요</h2><p className="mt-4 leading-7 text-slate-300">복잡한 비교 대신, 목표를 중심으로 차분히 상담해 드립니다.</p></div><div className="grid gap-4 sm:grid-cols-3">{["관심 수업 찾기", "관리자에게 문의", "상담 후 수업 시작"].map((text, i) => <div key={text} className="rounded-2xl bg-white/7 p-5"><span className="text-3xl font-black text-blue-300">0{i + 1}</span><p className="mt-6 font-bold">{text}</p></div>)}</div></div></div></section>
  </>;
}
