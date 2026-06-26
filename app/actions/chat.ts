"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ChatMessage } from "@/lib/types";
import { chatSchema } from "@/lib/validation";

function chatErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? "";
  if (normalized.includes("permission denied") || normalized.includes("row-level security")) {
    return "상담 메시지를 저장할 권한이 아직 설정되지 않았어요. 관리자에게 Supabase 권한 설정을 확인해 주세요.";
  }
  if (normalized.includes("violates foreign key")) {
    return "회원 프로필 정보가 아직 연결되지 않았어요. 잠시 후 다시 시도해 주세요.";
  }
  return "상담 메시지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

export async function startChatAction(courseId: string, formData: FormData) {
  const profile = await requireUser();
  if (profile.role === "TUTOR" && profile.tutor_status !== "APPROVED") redirect("/dashboard?pending=1");
  const parsed = chatSchema.safeParse({ course_id: courseId, body: formData.get("body") });
  if (!parsed.success) redirect(`/courses/${courseId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (!isSupabaseConfigured) redirect("/messages?thread=thread-demo");

  const supabase = await createClient();
  const { data: existingThread, error: threadLookupError } = await supabase!.from("chat_threads").select("id").eq("user_id", profile.id).eq("course_id", courseId).eq("status", "OPEN").maybeSingle();
  let thread = existingThread;
  if (threadLookupError) redirect(`/courses/${courseId}?error=${encodeURIComponent(chatErrorMessage(threadLookupError.message))}`);
  if (!thread) {
    const created = await supabase!.from("chat_threads").insert({ user_id: profile.id, course_id: courseId }).select("id").single();
    if (created.error) redirect(`/courses/${courseId}?error=${encodeURIComponent(chatErrorMessage(created.error.message))}`);
    thread = created.data;
  }
  if (!thread) redirect(`/courses/${courseId}?error=${encodeURIComponent(chatErrorMessage())}`);
  const messageResult = await supabase!.from("chat_messages").insert({ thread_id: thread.id, sender_id: profile.id, body: parsed.data.body });
  if (messageResult.error) redirect(`/courses/${courseId}?error=${encodeURIComponent(chatErrorMessage(messageResult.error.message))}`);
  redirect(`/messages?thread=${thread.id}`);
}

export async function sendMessageAction(threadId: string, formData: FormData) {
  const profile = await requireUser();
  const parsed = chatSchema.safeParse({ thread_id: threadId, body: formData.get("body") });
  if (!parsed.success) redirect(`/messages?thread=${threadId}&error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (!isSupabaseConfigured) redirect(`/messages?thread=${threadId}&sent=demo`);

  const supabase = await createClient();
  const { data: thread } = await supabase!.from("chat_threads").select("user_id,status").eq("id", threadId).single();
  if (!thread || thread.status !== "OPEN") redirect("/messages?error=closed");
  if (profile.role !== "ADMIN" && thread.user_id !== profile.id) redirect("/messages?error=forbidden");

  const { data: latest } = await supabase!.from("chat_messages").select("created_at").eq("sender_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (latest && Date.now() - new Date(latest.created_at).getTime() < 2000) redirect(`/messages?thread=${threadId}&error=rate-limit`);
  await supabase!.from("chat_messages").insert({ thread_id: threadId, sender_id: profile.id, body: parsed.data.body });
  revalidatePath("/messages");
  revalidatePath("/admin/messages");
  redirect(profile.role === "ADMIN" ? `/admin/messages?thread=${threadId}` : `/messages?thread=${threadId}`);
}

export async function sendInlineMessageAction(threadId: string, body: string): Promise<{ ok: true; message: ChatMessage } | { ok: false; error: string }> {
  const profile = await requireUser();
  const parsed = chatSchema.safeParse({ thread_id: threadId, body });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isSupabaseConfigured) {
    return {
      ok: true,
      message: {
        id: `demo-${Date.now()}`,
        thread_id: threadId,
        sender_id: profile.id,
        body: parsed.data.body,
        created_at: new Date().toISOString(),
        read_at: null,
        users_profile: { id: profile.id, name: profile.name, role: profile.role }
      }
    };
  }

  const supabase = await createClient();
  const { data: thread, error: threadError } = await supabase!.from("chat_threads").select("user_id,status").eq("id", threadId).single();
  if (threadError || !thread || thread.status !== "OPEN") return { ok: false, error: "종료되었거나 찾을 수 없는 상담입니다." };
  if (profile.role !== "ADMIN" && thread.user_id !== profile.id) return { ok: false, error: "이 대화에 메시지를 보낼 권한이 없습니다." };

  const { data: latest } = await supabase!.from("chat_messages").select("created_at").eq("sender_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (latest && Date.now() - new Date(latest.created_at).getTime() < 2000) {
    return { ok: false, error: "메시지는 2초에 한 번 보낼 수 있어요." };
  }

  const { data: message, error } = await supabase!
    .from("chat_messages")
    .insert({ thread_id: threadId, sender_id: profile.id, body: parsed.data.body })
    .select("id,thread_id,sender_id,body,created_at,read_at")
    .single();
  if (error || !message) return { ok: false, error: chatErrorMessage(error?.message) };

  revalidatePath("/messages");
  revalidatePath("/admin/messages");
  return {
    ok: true,
    message: {
      ...(message as ChatMessage),
      users_profile: { id: profile.id, name: profile.name, role: profile.role }
    }
  };
}

export async function adminSendMessageAction(threadId: string, formData: FormData) {
  await requireAdmin();
  return sendMessageAction(threadId, formData);
}
