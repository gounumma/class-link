import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
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

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return redirectWithCookies(request, `/login?next=${encodeURIComponent(nextPath)}&error=${encodeURIComponent("이메일 또는 비밀번호를 확인해 주세요.")}`);
  }

  return redirectWithCookies(request, nextPath, cookiesToSet);
}
