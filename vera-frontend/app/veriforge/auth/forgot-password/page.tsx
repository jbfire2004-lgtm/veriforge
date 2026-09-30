"use client";

import { useState } from "react";
import Link from "next/link";
import { VeriForgeButton, VeriForgeTextField } from "@/components/veriforge";
import { apiFetch } from "@/lib/api-fetch";

export default function VeriForgeForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [tenantSlug, setTenantSlug] = useState("alloy");
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await apiFetch("/veriforge/auth/forgot", {
      method: "POST",
      requireAuth: false,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tenantSlug }),
    });
    if (!res.ok) {
      setError("Unable to start password reset.");
      return;
    }
    const body = (await res.json()) as {
      data?: { resetToken?: string };
    };
    setDevToken(body.data?.resetToken ?? null);
    setSent(true);
  }

  return (
    <form className="space-y-[var(--vf-spacing-md)]" onSubmit={onSubmit}>
      <h1 className="font-[var(--vf-font-primary)] text-xl font-bold uppercase tracking-[0.12em] text-[var(--vf-color-safety-white)]">
        Forgot Password
      </h1>
      {sent ? (
        <div className="space-y-3 text-sm text-[#d0d0d0]">
          <p>
            If that account exists, a 30-minute reset token was issued. Production
            APIs never return the token in the response (email/ops channel only).
          </p>
          {devToken ? (
            <p>
              Local/dev token (not shown in production):{" "}
              <Link
                className="text-[#ffb8b8] underline"
                href={`/veriforge/auth/reset-password?token=${encodeURIComponent(devToken)}`}
              >
                continue to reset
              </Link>
            </p>
          ) : (
            <p>
              Already have a token?{" "}
              <Link href="/veriforge/auth/reset-password" className="text-[#ffb8b8]">
                Reset password
              </Link>
            </p>
          )}
        </div>
      ) : (
        <>
          <VeriForgeTextField
            label="Tenant slug"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            required
          />
          <VeriForgeTextField
            label="Email"
            type="email"
            placeholder="operator@veriforge.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error ? (
            <p className="text-xs text-[#ff8a80]" role="alert">
              {error}
            </p>
          ) : null}
          <VeriForgeButton type="submit" className="w-full">
            Send Recovery Link
          </VeriForgeButton>
        </>
      )}
      <p className="text-xs text-[#d0d0d0]">
        Back to <Link href="/veriforge/auth/login">Login</Link>
      </p>
    </form>
  );
}
