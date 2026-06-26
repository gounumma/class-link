import { requireAdmin } from "@/lib/auth";
import { getMessages, getThreads } from "@/lib/data";
import { MessagesView } from "@/components/messages-view";
import { Notice } from "@/components/ui/notice";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ thread?: string; error?: string }> }) {
  const [profile, params, threads] = await Promise.all([requireAdmin(), searchParams, getThreads()]);
  const selected = threads.find((thread) => thread.id === params.thread) ?? threads[0] ?? null;
  const messages = selected ? await getMessages(selected.id) : [];
  return <><div className="mb-7"><p className="text-sm font-bold text-blue-600">MESSAGES</p><h1 className="mt-2 text-3xl font-black">전체 문의 관리</h1><p className="mt-2 text-sm text-slate-500">학생과 보호자의 문의를 확인하고 답변하세요.</p></div>{params.error && <div className="mb-5"><Notice tone="error">메시지를 전송하지 못했습니다: {params.error}</Notice></div>}<MessagesView threads={threads} selected={selected} messages={messages} profile={profile} admin /></>;
}
