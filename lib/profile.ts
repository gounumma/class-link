import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

const ADMIN_EMAIL = "admin@classmoa.net";

export function profileFromUser(user: User): Profile | null {
  if (!user.email) return null;
  return {
    id: user.id,
    email: user.email,
    name: typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
      ? user.user_metadata.name.trim()
      : user.email.split("@")[0],
    phone: typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null,
    role: user.email.toLowerCase() === ADMIN_EMAIL ? "ADMIN" : "STUDENT",
    tutor_status: null,
    created_at: user.created_at ?? new Date().toISOString()
  };
}

export async function ensureProfileForUser(user: User): Promise<Profile | null> {
  const admin = createAdminClient();
  if (!admin || !user.email) return null;

  const fallbackProfile = profileFromUser(user);
  if (!fallbackProfile) return null;
  const payload = {
    id: fallbackProfile.id,
    email: fallbackProfile.email,
    name: fallbackProfile.name,
    phone: fallbackProfile.phone,
    role: fallbackProfile.role,
    tutor_status: fallbackProfile.tutor_status
  };

  const { data, error } = await admin
    .from("users_profile")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) return null;
  return data as Profile;
}
