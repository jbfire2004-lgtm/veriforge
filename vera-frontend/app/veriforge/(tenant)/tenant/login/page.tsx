"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  VeriForgeButton,
  VeriForgeTextField,
  VeriForgeAlert,
  VeriForgeLogo,
  VeriForgeFrame,
  useVeriForgeTenant,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

function TenantLoginFormInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useVeriForgeTenant();
  const [tenantSlug, setTenantSlug] = React.useState(search.get("slug") ?? "alloy");
  const isProd = process.env.NODE_ENV === "production";
  const [email, setEmail] = React.useState(isProd ? "" : "ops@alloy.works");
  const [password, setPassword] = React.useState(isProd ? "" : "Str0ng!Passw0rd");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await login({ tenantSlug, email, password });
      router.push(`/veriforge/tenant/${session.tenantId}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <VeriForgeFrame className="border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-6">
        <div className="mb-4 flex justify-center">
          <VeriForgeLogo />
        </div>
        <h1 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
          Tenant-Aware Login
        </h1>
        <p className="mt-2 text-sm text-[#b8b8b8]">
          Server login only. Tenant comes from the signed token, not from the
          tenant picker.
        </p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
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
            <VeriForgeAlert tone="critical" title="AUTH FAILED" message={error} />
          ) : null}
          <VeriForgeButton type="submit" className="w-full" disabled={busy}>
            Authenticate
          </VeriForgeButton>
          {process.env.NODE_ENV !== "production" ? (
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
        </form>
      </VeriForgeFrame>
    </div>
  );
}

export default function VeriForgeTenantLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto max-w-md border border-[#424242] bg-[#1A1A1A] p-6 text-sm text-[#b8b8b8]">
          Loading tenant auth…
        </div>
      }
    >
      <TenantLoginFormInner />
    </React.Suspense>
  );
}
