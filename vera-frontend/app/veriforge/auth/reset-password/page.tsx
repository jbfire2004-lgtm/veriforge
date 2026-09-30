"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VeriForgeButton, VeriForgeTextField } from "@/components/veriforge";
import { apiFetch } from "@/lib/api-fetch";

function ResetForm() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await apiFetch("/veriforge/auth/reset", {
      method: "POST",
      requireAuth: false,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const body = (await res.json()) as {
      status?: string;
      error?: { message?: string };
    };
    setBusy(false);
    if (!res.ok || body.status === "error") {
      setError(body.error?.message ?? "Reset failed");
      return;
    }
    setMessage("Password updated. You can sign in now.");
  }

  return (
    <form className="space-y-[var(--vf-spacing-md)]" onSubmit={onSubmit}>
      <h1 className="font-[var(--vf-font-primary)] text-xl font-bold uppercase tracking-[0.12em] text-[var(--vf-color-safety-white)]">
        Reset password
      </h1>
      <p className="text-xs text-[#d0d0d0]">
        Use the one-time token from forgot-password. New passwords need 12+
        characters with upper, lower, digit, and symbol.
      </p>
      <VeriForgeTextField
        label="Reset token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        required
      />
      <VeriForgeTextField
        label="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error ? (
        <p className="text-xs text-[#ff8a80]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-[#d0d0d0]">{message}</p> : null}
      <VeriForgeButton type="submit" className="w-full" disabled={busy}>
        Update password
      </VeriForgeButton>
      <p className="text-xs text-[#d0d0d0]">
        Back to <Link href="/veriforge/auth/login">Login</Link>
      </p>
    </form>
  );
}

export default function VeriForgeResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#d0d0d0]">Loading…</p>}>
      <ResetForm />
    </Suspense>
  );
}
