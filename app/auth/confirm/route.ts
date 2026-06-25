import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set<EmailOtpType>(["signup", "email", "recovery", "invite", "magiclink", "email_change"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const requestedNext = request.nextUrl.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
  const origin = request.nextUrl.origin;

  if (tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createClient();
    const { error } = supabase ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash }) : { error: new Error("Supabase is not configured") };
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("인증 링크가 만료되었거나 올바르지 않아요.")}`, origin));
}
