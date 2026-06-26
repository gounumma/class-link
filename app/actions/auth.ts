"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema, studentSignupSchema } from "@/lib/validation";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
  if (error || !data.user) fail("/signup/student", error?.message ?? "가입을 완료하지 못했어요.");
  redirect("/login?success=check-email");
}

export async function tutorSignupAction(formData: FormData) {
  redirect("/signup/student");
}
