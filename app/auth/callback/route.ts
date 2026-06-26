import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set<EmailOtpType>(["signup", "email", "recovery", "invite", "magiclink", "email_change"]);

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;
  const supabase = await createClient();

  if (code) {
    const { error } = supabase ? await supabase.auth.exchangeCodeForSession(code) : { error: new Error("Supabase is not configured") };
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  if (tokenHash && type && allowedTypes.has(type)) {
    const { error } = supabase ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash }) : { error: new Error("Supabase is not configured") };
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("이메일 인증 링크가 만료되었거나 올바르지 않아요.")}`, origin));
}
