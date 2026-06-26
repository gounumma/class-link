"use client";

import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !data.session) {
      setPending(false);
      setError("이메일 또는 비밀번호를 확인해 주세요.");
      return;
    }

    const sessionResponse = await fetch("/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      })
    });

    if (!sessionResponse.ok) {
      setPending(false);
      setError("로그인 세션을 저장하지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    const sessionPayload = await sessionResponse.json() as { adminToken?: string; adminSessionMaxAge?: number };
    if (sessionPayload.adminToken) {
      document.cookie = [
        `classmoa_admin_session=${sessionPayload.adminToken}`,
        "Path=/",
        `Max-Age=${sessionPayload.adminSessionMaxAge ?? 604800}`,
        "SameSite=Lax",
        location.protocol === "https:" ? "Secure" : ""
      ].filter(Boolean).join("; ");
    }

    window.location.assign(nextPath);
  }

  return (
    <>
      {error && <div className="mb-5"><Notice tone="error">{error}</Notice></div>}
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="이메일" required>
          <Input type="email" name="email" autoComplete="email" required placeholder="name@example.com" />
        </Field>
        <Field label="비밀번호" required>
          <PasswordInput name="password" autoComplete="current-password" required placeholder="비밀번호를 입력해 주세요" />
        </Field>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "로그인 중..." : "로그인"}</Button>
      </form>
    </>
  );
}
