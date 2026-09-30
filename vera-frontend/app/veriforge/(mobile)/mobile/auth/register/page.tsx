"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VeriForgeButton,
  VeriForgeTextField,
  VERIFORGE_MOBILE_BASE,
  veriforgeTypography,
  MobileMetallicPanel,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

export default function VeriForgeMobileRegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`${VERIFORGE_MOBILE_BASE}/dashboard`);
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-[#1A1A1A] px-4 py-8">
      <MobileMetallicPanel className="mx-auto w-full max-w-md">
        <h1 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>Register</h1>
        <p className="mt-2 text-sm text-[#b8b8b8]">
          Create a field operator account with company metadata.
        </p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <VeriForgeTextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            label="Company ID"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="co-alloy"
            required
          />
          <VeriForgeTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <VeriForgeButton type="submit" className="w-full">
            Create Account
          </VeriForgeButton>
        </form>
        <p className="mt-4 text-xs text-[#d0d0d0]">
          Already forged in?{" "}
          <Link href={`${VERIFORGE_MOBILE_BASE}/auth/login`} className="text-[#ffb8b8]">
            Login
          </Link>
        </p>
      </MobileMetallicPanel>
    </div>
  );
}
