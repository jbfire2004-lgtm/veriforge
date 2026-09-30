"use client";

import * as React from "react";
import Link from "next/link";
import {
  VeriForgeButton,
  VeriForgeTextField,
  VeriForgeAlert,
  VERIFORGE_MOBILE_BASE,
  veriforgeTypography,
  MobileMetallicPanel,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

export default function VeriForgeMobileForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await apiFetch("/veriforge/auth/forgot", {
      method: "POST",
      requireAuth: false,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[#1A1A1A] px-4 py-8">
      <MobileMetallicPanel className="mx-auto w-full max-w-md">
        <h1 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-[#b8b8b8]">
          Reset credentials with a forged recovery link.
        </p>
        {sent ? (
          <div className="mt-5">
            <VeriForgeAlert
              tone="success"
              title="RESET QUEUED"
              message="If the account exists, a recovery link was forged and sent."
            />
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <VeriForgeTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <VeriForgeButton type="submit" className="w-full">
              Send Reset Link
            </VeriForgeButton>
          </form>
        )}
        <p className="mt-4 text-xs text-[#d0d0d0]">
          <Link href={`${VERIFORGE_MOBILE_BASE}/auth/login`} className="text-[#ffb8b8]">
            Back to login
          </Link>
        </p>
      </MobileMetallicPanel>
    </div>
  );
}
