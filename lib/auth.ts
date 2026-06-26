import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoProfiles } from "@/lib/demo-data";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (!isSupabaseConfigured) return demoProfiles[0];
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const cookieStore = await cookies();
    return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  }
  const { data } = await supabase.from("users_profile").select("*").eq("id", user.id).single();
  if (data) return data as Profile;
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
});

export async function requireUser() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();
  if (profile.role !== "ADMIN") redirect("/dashboard?error=forbidden");
  return profile;
}
