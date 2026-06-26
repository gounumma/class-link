import { createHmac, timingSafeEqual } from "crypto";
import type { Profile } from "@/lib/types";

export const ADMIN_SESSION_COOKIE = "classmoa_admin_session";

const ADMIN_EMAIL = "admin@classmoa.net";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function getSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "classmoa-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(email: string) {
  if (email.toLowerCase() !== ADMIN_EMAIL) return null;
  const payload = base64url(JSON.stringify({ email: ADMIN_EMAIL, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS }));
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token?: string): Profile | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; exp?: number };
    if (data.email !== ADMIN_EMAIL || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: "classmoa-admin-session",
      email: ADMIN_EMAIL,
      name: "관리자",
      phone: null,
      role: "ADMIN",
      tutor_status: null,
      created_at: new Date(0).toISOString()
    };
  } catch {
    return null;
  }
}

export const adminSessionMaxAge = MAX_AGE_SECONDS;
