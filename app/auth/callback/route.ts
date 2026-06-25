import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = supabase ? await supabase.auth.exchangeCodeForSession(code) : { error: new Error("Supabase is not configured") };
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("이메일 인증 링크가 만료되었거나 올바르지 않아요.")}`, origin));
}
