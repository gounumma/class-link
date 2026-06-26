import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { ok: true, service: "classlink", mode: "demo", database: "not-configured", checkedAt },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase!.from("courses").select("id", { head: true, count: "exact" }).limit(1);
  if (error) {
    console.error("Health check database error", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  return NextResponse.json(
    { ok: !error, service: "classlink", mode: "production", database: error ? "unreachable" : "reachable", checkedAt },
    { status: error ? 503 : 200, headers: { "Cache-Control": "no-store" } }
  );
}
