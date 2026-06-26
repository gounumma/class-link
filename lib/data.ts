import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoMessages, demoThreads } from "@/lib/demo-data";
import { getDemoCourses } from "@/lib/demo-store";
import type { ChatMessage, ChatThread, Course } from "@/lib/types";

export async function getCourses(includeDrafts = false): Promise<Course[]> {
  noStore();
  if (!isSupabaseConfigured) {
    const courses = getDemoCourses().sort((a, b) => a.sort_order - b.sort_order);
    return includeDrafts ? courses : courses.filter((course) => course.is_published);
  }
  const supabase = await createClient();
  if (!supabase) return [];
  let query = supabase.from("courses").select("*").order("sort_order");
  if (!includeDrafts) query = query.eq("is_published", true);
  const { data } = await query;
  return (data ?? []) as Course[];
}

export async function getFeaturedCourses(): Promise<Course[]> {
  noStore();
  if (!isSupabaseConfigured) return getDemoCourses().filter((course) => course.is_published && course.is_featured).sort((a, b) => a.sort_order - b.sort_order).slice(0, 6);
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order")
    .limit(6);
  return (data ?? []) as Course[];
}

export async function getCourse(id: string, includeDrafts = false): Promise<Course | null> {
  noStore();
  if (!isSupabaseConfigured) return getDemoCourses().find((c) => c.id === id && (includeDrafts || c.is_published)) ?? null;
  const supabase = await createClient();
  if (!supabase) return null;
  let query = supabase.from("courses").select("*").eq("id", id);
  if (!includeDrafts) query = query.eq("is_published", true);
  const { data } = await query.maybeSingle();
  return data as Course | null;
}

export async function getThreads(userId?: string): Promise<ChatThread[]> {
  noStore();
  if (!isSupabaseConfigured) return userId ? demoThreads.filter((t) => t.user_id === userId) : demoThreads;
  const supabase = await createClient();
  let query = supabase!.from("chat_threads").select("*, courses(id,title), users_profile(id,name,email,role)").order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data } = await query;
  return (data ?? []) as unknown as ChatThread[];
}

export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  noStore();
  if (!isSupabaseConfigured) return demoMessages.filter((m) => m.thread_id === threadId);
  const supabase = await createClient();
  const { data } = await supabase!.from("chat_messages").select("*, users_profile(id,name,role)").eq("thread_id", threadId).order("created_at");
  return (data ?? []) as unknown as ChatMessage[];
}
