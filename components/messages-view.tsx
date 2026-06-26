import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { ChatMessage, ChatThread, Profile } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MessageThread } from "@/components/message-thread";

const roleLabel = { STUDENT: "학생", TUTOR: "튜터", ADMIN: "관리자" } as const;

export function MessagesView({ threads, selected, messages, profile, admin = false }: { threads: ChatThread[]; selected: ChatThread | null; messages: ChatMessage[]; profile: Profile; admin?: boolean }) {
  const base = admin ? "/admin/messages" : "/messages";
  return <div className="grid min-h-[620px] overflow-hidden rounded-2xl border bg-white shadow-soft lg:grid-cols-[320px_1fr]">
    <aside className="border-b bg-slate-50/70 lg:border-b-0 lg:border-r"><div className="border-b p-5"><h2 className="font-extrabold text-navy-950">문의 목록</h2><p className="mt-1 text-xs text-slate-500">{threads.length}개의 대화</p></div><div className="max-h-[550px] overflow-y-auto">{threads.length ? threads.map((thread) => <Link key={thread.id} href={`${base}?thread=${thread.id}`} className={cn("block border-b p-5 transition hover:bg-white", selected?.id === thread.id && "bg-white shadow-[inset_3px_0_0_#2563eb]")}><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold text-navy-950">{admin ? thread.users_profile?.name : thread.courses?.title ?? "일반 문의"}</p><Badge tone="slate">{thread.status === "OPEN" ? "진행 중" : "종료"}</Badge></div><p className="mt-2 truncate text-xs text-slate-500">{admin ? thread.courses?.title ?? "일반 문의" : "관리자와의 1:1 상담"}</p><p className="mt-2 text-[11px] text-slate-400">{formatDate(thread.created_at)}</p></Link>) : <div className="p-10 text-center text-sm text-slate-400">아직 문의가 없어요.</div>}</div></aside>
    <section className="flex min-w-0 flex-col">{selected ? <><header className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="truncate font-extrabold">{admin ? `${selected.users_profile?.name}님의 문의` : selected.courses?.title ?? "수업 문의"}</h2>{admin && <p className="mt-1 text-xs text-slate-500">{selected.users_profile?.email} · {selected.users_profile?.role && roleLabel[selected.users_profile.role]}</p>}</div><Badge tone={selected.status === "OPEN" ? "green" : "slate"}>{selected.status === "OPEN" ? "상담 중" : "종료"}</Badge></header><MessageThread threadId={selected.id} initialMessages={messages} profile={profile} open={selected.status === "OPEN"} /></> : <div className="grid flex-1 place-items-center p-10 text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50"><MessageCircle className="text-blue-600" /></div><h2 className="mt-5 text-xl font-extrabold">대화를 선택해 주세요</h2><p className="mt-2 text-sm text-slate-500">목록에서 확인할 문의를 선택하세요.</p></div></div>}</section>
  </div>;
}
