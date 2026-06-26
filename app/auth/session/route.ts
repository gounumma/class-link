import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSessionToken, adminSessionMaxAge } from "@/lib/admin-session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => null) as { access_token?: string; refresh_token?: string } | null;
  if (!body?.access_token || !body.refresh_token) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, {
            ...options,
            path: options.path ?? "/",
            sameSite: options.sameSite ?? "lax",
            secure: process.env.NODE_ENV === "production"
          }));
        }
      }
    }
  );

  const { error } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token
  });

  if (error) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  const adminToken = user?.email ? createAdminSessionToken(user.email) : null;
  return NextResponse.json({ ok: true, adminToken, adminSessionMaxAge }, { headers: response.headers });
}
