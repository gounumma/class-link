"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema, studentSignupSchema, tutorSignupSchema, validateCertificate } from "@/lib/validation";

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
  const parsed = tutorSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("/signup/tutor", parsed.error.issues[0].message);
  const certificate = formData.get("certificate");
  if (!(certificate instanceof File) || certificate.size === 0) fail("/signup/tutor", "재학 또는 졸업 증명서를 첨부해 주세요.");
  const fileError = await validateCertificate(certificate);
  if (fileError) fail("/signup/tutor", fileError);
  if (!isSupabaseConfigured) redirect("/login?success=tutor-demo");
  const admin = createAdminClient();
  if (!admin) fail("/signup/tutor", "서버 저장소 설정이 완료되지 않았어요. 관리자에게 문의해 주세요.");

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase!.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`, data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: "TUTOR",
      tutor_status: "PENDING",
      terms_version: "2026-06-24",
      privacy_version: "2026-06-24",
      marketing_agreed: parsed.data.marketing === "on"
    } }
  });
  if (error || !data.user) fail("/signup/tutor", error?.message ?? "가입을 완료하지 못했어요.");

  const extension = certificate.type === "application/pdf" ? "pdf" : certificate.type === "image/png" ? "png" : "jpg";
  const filePath = `${data.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await admin.storage.from("tutor-certificates").upload(filePath, certificate, {
    contentType: certificate.type,
    upsert: false
  });
  if (uploadError) {
    await admin.auth.admin.deleteUser(data.user.id);
    fail("/signup/tutor", "증명서 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }

  const { error: applicationError } = await admin.from("tutor_applications").insert({
    user_id: data.user.id,
    school_name: parsed.data.school_name,
    major: parsed.data.major || null,
    education_status: parsed.data.education_status,
    career: parsed.data.career || null,
    bio: parsed.data.bio,
    certificate_file_path: filePath,
    status: "PENDING"
  });
  if (applicationError) {
    await admin.storage.from("tutor-certificates").remove([filePath]);
    await admin.auth.admin.deleteUser(data.user.id);
    fail("/signup/tutor", "지원서 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }
  redirect("/login?success=tutor-pending");
}
