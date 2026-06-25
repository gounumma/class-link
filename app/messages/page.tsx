import { requireUser } from "@/lib/auth";
import { getMessages, getThreads } from "@/lib/data";
import { MessagesView } from "@/components/messages-view";
import { Notice } from "@/components/ui/notice";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ thread?: string; error?: string; sent?: string }> }) {
  const [profile, params] = await Promise.all([requireUser(), searchParams]);
  const threads = await getThreads(profile.role === "ADMIN" ? undefined : profile.id);
  const selected = threads.find((thread) => thread.id === params.thread) ?? threads[0] ?? null;
  const messages = selected ? await getMessages(selected.id) : [];
  const errors: Record<string, string> = { "rate-limit": "메시지는 2초에 한 번 보낼 수 있어요.", closed: "종료된 상담에는 메시지를 보낼 수 없어요.", forbidden: "이 대화를 볼 권한이 없습니다." };
  return <div className="bg-slate-50/70 py-12"><div className="container-page"><div className="mb-7"><p className="text-sm font-bold text-blue-600">1:1 CONSULTATION</p><h1 className="mt-2 text-3xl font-black">문의 메시지</h1><p className="mt-2 text-sm text-slate-500">관리자와 나눈 상담 내용은 안전하게 보호됩니다.</p></div>{params.error && <div className="mb-5"><Notice tone="error">{errors[params.error] ?? params.error}</Notice></div>}{params.sent && <div className="mb-5"><Notice tone="success">데모 모드에서 메시지 전송 흐름을 확인했어요.</Notice></div>}<MessagesView threads={threads} selected={selected} messages={messages} profile={profile} /></div></div>;
}
