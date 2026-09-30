"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VeriForgeButton, VeriForgeTextField } from "@/components/veriforge";
import { persistTenantSession } from "@/components/veriforge/tenant-saas";
import { apiFetch } from "@/lib/api-fetch";

type LoginEnvelope = {
  status?: string;
  data?: {
    accessToken?: string;
    user?: { id?: number; email?: string; role?: string; tenantId?: string };
    tenant?: {
      tenantId?: string;
      slug?: string;
      name?: string;
      branding?: {
        logoUrl: string | null;
        primaryColor: string | null;
        accentColor: string | null;
        useDefaultForgeIdentity: boolean;
      };
    };
  };
  error?: { message?: string };
};

export default function VeriForgeLoginPage() {
  const router = useRouter();
  const isProd = process.env.NODE_ENV === "production";
  const [email, setEmail] = useState(isProd ? "" : "ops@alloy.works");
  const [password, setPassword] = useState(isProd ? "" : "Str0ng!Passw0rd");
  const [tenantSlug, setTenantSlug] = useState("alloy");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/veriforge/auth/login", {
        method: "POST",
        requireAuth: false,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenantSlug }),
      });
      const body = (await res.json()) as LoginEnvelope;
      if (!res.ok || !body.data?.accessToken || !body.data.tenant?.tenantId) {
        throw new Error(body.error?.message ?? "Invalid credentials");
      }
      persistTenantSession({
        tenantId: body.data.tenant.tenantId,
        slug: body.data.tenant.slug ?? tenantSlug,
        name: body.data.tenant.name ?? tenantSlug,
        accessToken: body.data.accessToken,
        userId: body.data.user?.id ?? 0,
        email: body.data.user?.email ?? email,
        role: body.data.user?.role ?? "Worker",
        branding: body.data.tenant.branding ?? {
          logoUrl: null,
          primaryColor: "#C62828",
          accentColor: "#424242",
          useDefaultForgeIdentity: true,
        },
      });
      router.push(`/veriforge/tenant/${body.data.tenant.tenantId}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-[var(--vf-spacing-md)]" onSubmit={onSubmit}>
      <h1 className="font-[var(--vf-font-primary)] text-xl font-bold uppercase tracking-[0.12em] text-[var(--vf-color-safety-white)]">
        Login
      </h1>
      <p className="text-xs text-[#d0d0d0]">
        {isProd
          ? "Use the account issued for this environment."
          : "Local checkout is prefilled with the Alloy Admin seed. Switch to the Auditor preview if you want the same view a third-party reviewer will get."}
      </p>
      <VeriForgeTextField
        label="Tenant slug"
        value={tenantSlug}
        onChange={(e) => setTenantSlug(e.target.value)}
        required
      />
      <VeriForgeTextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <VeriForgeTextField
        label="Password"
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
      <VeriForgeButton type="submit" className="w-full" disabled={busy}>
        Authenticate
      </VeriForgeButton>
      {!isProd ? (
        <button
          type="button"
          className="w-full text-left text-[11px] uppercase tracking-[0.1em] text-[#d0d0d0] underline"
          onClick={() => {
            setEmail("reviewer@alloy.works");
            setPassword("Review!Only2026");
            setTenantSlug("alloy");
          }}
        >
          Fill Auditor reviewer account
        </button>
      ) : null}
      <div className="flex justify-between text-xs text-[#d0d0d0]">
        <Link href="/veriforge/auth/forgot-password">Forgot password</Link>
        <Link href="/veriforge/auth/reset-password">Have a reset token</Link>
      </div>
    </form>
  );
}
