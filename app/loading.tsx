export default function Loading() {
  return <div className="container-page animate-pulse py-16" aria-label="페이지를 불러오는 중"><div className="h-4 w-28 rounded bg-slate-200" /><div className="mt-5 h-11 max-w-xl rounded-xl bg-slate-200" /><div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" /><div className="mt-12 grid gap-6 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 rounded-2xl bg-slate-100" />)}</div><span className="sr-only">불러오는 중</span></div>;
}
