"use client";

import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  function getLoginErrorMessage(message?: string) {
    const normalized = message?.toLowerCase() ?? "";
    if (normalized.includes("email not confirmed") || normalized.includes("not confirmed")) {
      return "이메일 인증이 아직 완료되지 않았어요. 받은 메일의 인증 링크를 먼저 눌러 주세요.";
    }
    if (normalized.includes("invalid login credentials")) {
      return "이메일 또는 비밀번호가 맞지 않거나, 이메일 인증이 아직 완료되지 않았을 수 있어요. 인증 메일을 못 받으셨다면 아래에서 다시 받아 주세요.";
    }
    return "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const loginEmail = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setEmail(loginEmail);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

    if (loginError || !data.session) {
      setPending(false);
      setError(getLoginErrorMessage(loginError?.message));
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
      const payload = await sessionResponse.json().catch(() => null) as { error?: string } | null;
      setPending(false);
      setError(payload?.error ?? "로그인 세션을 저장하지 못했습니다. 다시 시도해 주세요.");
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

  async function resendConfirmation() {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError("인증 메일을 받을 이메일을 먼저 입력해 주세요.");
      return;
    }

    setError(null);
    setNotice(null);
    setResending(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: targetEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
    });

    setResending(false);
    if (resendError) {
      const normalized = resendError.message.toLowerCase();
      if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
        setError("인증 메일을 방금 요청했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (normalized.includes("already confirmed") || normalized.includes("confirmed")) {
        setNotice("이미 인증된 이메일입니다. 비밀번호로 로그인해 주세요.");
        return;
      }
      setError("인증 메일을 다시 보내지 못했습니다. 이메일 주소를 확인해 주세요.");
      return;
    }

    setNotice("인증 메일을 다시 보냈어요. 이메일함과 스팸함을 확인해 주세요.");
  }

  return (
    <>
      {error && <div className="mb-5"><Notice tone="error">{error}</Notice></div>}
      {notice && <div className="mb-5"><Notice tone="success">{notice}</Notice></div>}
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="이메일" required>
          <Input type="email" name="email" autoComplete="email" required placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="비밀번호" required>
          <PasswordInput name="password" autoComplete="current-password" required placeholder="비밀번호를 입력해 주세요" />
        </Field>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "로그인 중..." : "로그인"}</Button>
      </form>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        인증 메일을 못 받으셨나요?
        <button type="button" onClick={resendConfirmation} disabled={resending} className="ml-2 font-bold text-blue-700 disabled:opacity-50">
          {resending ? "재발송 중..." : "인증 메일 다시 받기"}
        </button>
      </div>
    </>
  );
}
