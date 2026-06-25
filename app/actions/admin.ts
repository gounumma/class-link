"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { deleteDemoCourse, saveDemoCourse, setDemoCoursePublished } from "@/lib/demo-store";
import { courseSchema, reviewTutorSchema } from "@/lib/validation";

export async function saveCourseAction(courseId: string | null, formData: FormData) {
  await requireAdmin();
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${courseId ? `/admin/courses/${courseId}/edit` : "/admin/courses/new"}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const payload = {
    ...parsed.data,
    subject: parsed.data.subject || null,
    grade_level: parsed.data.grade_level || null,
    short_description: parsed.data.short_description || null,
    full_description: parsed.data.full_description || null,
    schedule_text: parsed.data.schedule_text || null,
    price_text: parsed.data.price_text || null,
    image_url: parsed.data.image_url || null
  };
  if (!isSupabaseConfigured) {
    saveDemoCourse(courseId, payload);
    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath("/admin/courses");
    redirect("/admin/courses?success=demo-saved");
  }

  const supabase = await createClient();
  const result = courseId
    ? await supabase!.from("courses").update(payload).eq("id", courseId)
    : await supabase!.from("courses").insert(payload);
  if (result.error) redirect(`${courseId ? `/admin/courses/${courseId}/edit` : "/admin/courses/new"}?error=${encodeURIComponent("저장하지 못했어요.")}`);
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  redirect("/admin/courses?success=saved");
}

export async function deleteCourseAction(courseId: string) {
  await requireAdmin();
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase!.from("courses").delete().eq("id", courseId);
  } else deleteDemoCourse(courseId);
  revalidatePath("/");
  revalidatePath("/admin/courses");
  redirect("/admin/courses?success=deleted");
}

export async function toggleCoursePublishedAction(courseId: string, nextPublished: boolean) {
  await requireAdmin();
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase!.from("courses").update({ is_published: nextPublished }).eq("id", courseId);
    if (error) redirect("/admin/courses?error=status");
  } else {
    setDemoCoursePublished(courseId, nextPublished);
  }
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?success=${nextPublished ? "published" : "unpublished"}`);
}

export async function reviewTutorAction(formData: FormData) {
  const adminProfile = await requireAdmin();
  const parsed = reviewTutorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/admin/tutors?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  if (isSupabaseConfigured) {
    const admin = createAdminClient();
    if (!admin) redirect("/admin/tutors?error=server-config");
    const { data: application } = await admin.from("tutor_applications").select("user_id").eq("id", parsed.data.application_id).single();
    if (!application) redirect("/admin/tutors?error=not-found");
    await admin.from("tutor_applications").update({
      status: parsed.data.decision,
      rejection_reason: parsed.data.decision === "REJECTED" ? parsed.data.rejection_reason : null,
      reviewed_by: adminProfile.id,
      reviewed_at: new Date().toISOString()
    }).eq("id", parsed.data.application_id);
    await admin.from("users_profile").update({ tutor_status: parsed.data.decision }).eq("id", application.user_id);
  }
  revalidatePath("/admin/tutors");
  redirect("/admin/tutors?success=reviewed");
}

export async function getCertificateUrlAction(applicationId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from("tutor_applications").select("certificate_file_path").eq("id", applicationId).single();
  if (!data?.certificate_file_path) return null;
  const { data: signed } = await admin.storage.from("tutor-certificates").createSignedUrl(data.certificate_file_path, 60);
  return signed?.signedUrl ?? null;
}
