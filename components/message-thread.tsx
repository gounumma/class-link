"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendInlineMessageAction } from "@/app/actions/chat";
import type { ChatMessage, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

const roleLabel = { STUDENT: "학생", TUTOR: "튜터", ADMIN: "관리자" } as const;

function MessageBubble({ message, profile }: { message: ChatMessage; profile: Profile }) {
  const mine = message.sender_id === profile.id;
  const role = message.users_profile?.role ?? (mine ? profile.role : "ADMIN");

  return <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
    <div className={cn("max-w-[82%]", mine && "text-right")}>
      <div className="mb-1.5 flex items-center gap-2 text-[11px] text-slate-400">
        <span>{message.users_profile?.name ?? (mine ? profile.name : "관리자")}</span>
        <Badge tone={role === "ADMIN" ? "blue" : role === "TUTOR" ? "green" : "slate"}>{roleLabel[role]}</Badge>
      </div>
      <div className={cn(
        "whitespace-pre-wrap rounded-2xl px-4 py-3 text-left text-sm leading-6",
        mine ? "rounded-tr-sm bg-navy-900 text-white" : "rounded-tl-sm bg-slate-100 text-slate-700",
        message.id.startsWith("pending-") && "opacity-70"
      )}>{message.body}</div>
    </div>
  </div>;
}

export function MessageThread({ threadId, initialMessages, profile, open }: { threadId: string; initialMessages: ChatMessage[]; profile: Profile; open: boolean }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || isPending) return;

    const pendingId = `pending-${Date.now()}`;
    setError(null);
    setBody("");
    setMessages((current) => [...current, {
      id: pendingId,
      thread_id: threadId,
      sender_id: profile.id,
      body: trimmed,
      created_at: new Date().toISOString(),
      read_at: null,
      users_profile: { id: profile.id, name: profile.name, role: profile.role }
    }]);

    startTransition(async () => {
      const result = await sendInlineMessageAction(threadId, trimmed);
      if (!result.ok) {
        setMessages((current) => current.filter((message) => message.id !== pendingId));
        setError(result.error);
        setBody(trimmed);
        return;
      }

      setMessages((current) => current.map((message) => message.id === pendingId ? result.message : message));
      router.refresh();
    });
  }

  return <>
    <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto bg-white p-5 sm:p-7">
      {messages.map((message) => <MessageBubble key={message.id} message={message} profile={profile} />)}
    </div>
    {open && <form onSubmit={onSubmit} className="border-t bg-slate-50 p-4">
      {error && <div className="mb-3"><Notice tone="error">{error}</Notice></div>}
      <div className="flex gap-3">
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={1000} placeholder="메시지를 입력해 주세요" className="min-h-12 resize-none bg-white" />
        <Button type="submit" className="h-auto w-12 shrink-0 px-0" aria-label="메시지 보내기" disabled={isPending || !body.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-right text-[11px] text-slate-400">최대 1,000자 · 연속 전송 제한 2초</p>
    </form>}
  </>;
}
