"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema, studentSignupSchema } from "@/lib/validation";

async function getSiteUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin?.startsWith("http://") || origin?.startsWith("https://")) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function isAlreadyRegisteredError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("already registered") || normalized.includes("already exists") || normalized.includes("user already");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("/login", parsed.error.issues[0].message);
  const requestedNext = formData.get("next");
  const nextPath = typeof requestedNext === "string" && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard";
  if (!isSupabaseConfigured) redirect(`${nextPath}${nextPath.includes("?") ? "&" : "?"}demo=1`);

  const supabase = await createClient();
  const { error } = await supabase!.auth.signInWithPassword(parsed.data);
  if (error) fail("/login", "이메일 또는 비밀번호를 확인해 주세요.");
  redirect(nextPath);
}

export async function logoutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export async function studentSignupAction(formData: FormData) {
  const parsed = studentSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("/signup/student", parsed.error.issues[0].message);
  if (!isSupabaseConfigured) redirect("/login?success=student-demo");

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { data, error } = await supabase!.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`, data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: "STUDENT",
      terms_version: "2026-06-24",
      privacy_version: "2026-06-24",
      marketing_agreed: parsed.data.marketing === "on"
    } }
  });
  const existingAccount = Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
  if ((error && isAlreadyRegisteredError(error.message)) || existingAccount) {
    const { error: resendError } = await supabase!.auth.resend({
      type: "signup",
      email: parsed.data.email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard` }
    });
    if (resendError) {
      const normalized = resendError.message.toLowerCase();
      if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
        fail("/login", "인증 메일을 방금 요청했어요. 잠시 후 다시 시도해 주세요.");
      }
      fail("/login", "인증 메일을 다시 보내지 못했습니다. 이메일 주소를 확인해 주세요.");
    }
    redirect("/login?success=resend-email");
  }
  if (error || !data.user) fail("/signup/student", error?.message ?? "가입을 완료하지 못했어요.");
  redirect("/login?success=check-email");
}

export async function tutorSignupAction() {
  redirect("/signup/student");
}
