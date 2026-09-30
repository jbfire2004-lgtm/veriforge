"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VeriForgeButton,
  VeriForgeTextField,
  VeriForgeMobileEmblem,
  VERIFORGE_MOBILE_BASE,
  veriforgeTypography,
  MobileMetallicPanel,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

export default function VeriForgeMobileLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`${VERIFORGE_MOBILE_BASE}/dashboard`);
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[#1A1A1A] px-4 py-8">
      <div className="mx-auto mb-6 flex flex-col items-center">
        <VeriForgeMobileEmblem className="h-20 w-20" />
        <p className={cn(veriforgeTypography.heading, "mt-4 text-sm text-[#FAFAFA]")}>
          FIELD AUTH
        </p>
      </div>

      <MobileMetallicPanel className="mx-auto w-full max-w-md border-[#424242]">
        <h1 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>Login</h1>
        <p className="mt-2 text-sm text-[#b8b8b8]">
          Authenticate to enter forged-metal field operations.
        </p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <VeriForgeTextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@veriforge.io"
            required
          />
          <VeriForgeTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <VeriForgeButton type="submit" className="w-full">
            Authenticate
          </VeriForgeButton>
        </form>
        <div className="mt-4 flex justify-between text-xs text-[#d0d0d0]">
          <Link href={`${VERIFORGE_MOBILE_BASE}/auth/register`}>Create account</Link>
          <Link href={`${VERIFORGE_MOBILE_BASE}/auth/forgot-password`}>Forgot password</Link>
        </div>
      </MobileMetallicPanel>
    </div>
  );
}
