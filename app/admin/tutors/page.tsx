import { ChevronRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { getTutorApplications } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { formatDate } from "@/lib/utils";

const statusInfo = { PENDING: { label: "심사 대기", tone: "amber" }, APPROVED: { label: "승인", tone: "green" }, REJECTED: { label: "반려", tone: "red" } } as const;

export default async function AdminTutorsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [applications, params] = await Promise.all([getTutorApplications(), searchParams]);
  return <><div><p className="text-sm font-bold text-blue-600">TUTOR REVIEW</p><h1 className="mt-2 text-3xl font-black">튜터 지원 관리</h1><p className="mt-2 text-sm text-slate-500">지원 정보와 학력 증명서를 확인하고 승인 여부를 결정하세요.</p></div>{params.success && <div className="mt-6"><Notice tone="success">심사 결과를 저장했습니다.</Notice></div>}{params.error && <div className="mt-6"><Notice tone="error">{params.error}</Notice></div>}<div className="mt-7 space-y-3">{applications.map((item) => { const status = statusInfo[item.status]; return <Link href={`/admin/tutors/${item.id}`} key={item.id} className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-soft transition hover:border-blue-200"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 font-black text-blue-700">{item.users_profile?.name?.slice(0, 1) ?? "튜"}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-extrabold text-navy-950">{item.users_profile?.name ?? "지원자"}</h2><Badge tone={status.tone}>{status.label}</Badge></div><p className="mt-1 truncate text-sm text-slate-500">{item.school_name} · {item.major || "전공 미입력"} · {item.education_status === "ENROLLED" ? "재학" : "졸업"}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Clock3 className="size-3" />{formatDate(item.created_at)} 지원</p></div><ChevronRight className="size-5 text-slate-300" /></Link>; })}{!applications.length && <div className="rounded-2xl border border-dashed py-20 text-center text-sm text-slate-400">접수된 튜터 지원이 없습니다.</div>}</div></>;
}
