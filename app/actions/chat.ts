"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { chatSchema } from "@/lib/validation";

export async function startChatAction(courseId: string, formData: FormData) {
  const profile = await requireUser();
  if (profile.role === "TUTOR" && profile.tutor_status !== "APPROVED") redirect("/dashboard?pending=1");
  const parsed = chatSchema.safeParse({ course_id: courseId, body: formData.get("body") });
  if (!parsed.success) redirect(`/courses/${courseId}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (!isSupabaseConfigured) redirect("/messages?thread=thread-demo");

  const supabase = await createClient();
  let { data: thread } = await supabase!.from("chat_threads").select("id").eq("user_id", profile.id).eq("course_id", courseId).eq("status", "OPEN").maybeSingle();
  if (!thread) {
    const created = await supabase!.from("chat_threads").insert({ user_id: profile.id, course_id: courseId }).select("id").single();
    thread = created.data;
  }
  if (!thread) redirect(`/courses/${courseId}?error=chat`);
  await supabase!.from("chat_messages").insert({ thread_id: thread.id, sender_id: profile.id, body: parsed.data.body });
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

export async function adminSendMessageAction(threadId: string, formData: FormData) {
  await requireAdmin();
  return sendMessageAction(threadId, formData);
}
