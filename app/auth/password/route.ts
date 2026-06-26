import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionMaxAge, createAdminSessionToken } from "@/lib/admin-session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema } from "@/lib/validation";

function safeNext(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function redirectWithCookies(request: NextRequest, path: string, cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []) {
  const response = NextResponse.redirect(new URL(path, request.url), { status: 303 });
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, {
    ...options,
    path: options.path ?? "/",
    sameSite: options.sameSite ?? "lax",
    secure: process.env.NODE_ENV === "production"
  }));
  return response;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const nextPath = safeNext(formData.get("next"));
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return redirectWithCookies(request, `/login?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  if (!isSupabaseConfigured) return redirectWithCookies(request, `${nextPath}${nextPath.includes("?") ? "&" : "?"}demo=1`);

  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.splice(0, cookiesToSet.length, ...items);
        }
      }
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const normalized = error.message.toLowerCase();
    const message = normalized.includes("email not confirmed") || normalized.includes("not confirmed")
      ? "이메일 인증이 아직 완료되지 않았어요. 받은 메일의 인증 링크를 먼저 눌러 주세요."
      : "이메일 또는 비밀번호가 맞지 않거나, 이메일 인증이 아직 완료되지 않았을 수 있어요. 인증 메일을 못 받으셨다면 아래에서 다시 받아 주세요.";
    return redirectWithCookies(request, `/login?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent(message)}`);
  }

  const response = redirectWithCookies(request, nextPath, cookiesToSet);
  const adminToken = data.user?.email ? createAdminSessionToken(data.user.email) : null;
  if (adminToken) {
    response.cookies.set(ADMIN_SESSION_COOKIE, adminToken, {
      path: "/",
      maxAge: adminSessionMaxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  } else {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }
  return response;
}
