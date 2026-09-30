"use client";

import * as React from "react";
import Link from "next/link";
import {
  MobileAngularCard,
  MobileScreenHeader,
  VeriForgeButton,
  VeriForgeTextField,
  VERIFORGE_MOBILE_BASE,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

export default function VeriForgeMobileProfilePage() {
  const [name, setName] = React.useState("Jordan Forge");
  const [email, setEmail] = React.useState("jordan@alloyworks.io");
  const [companyId, setCompanyId] = React.useState("co-alloy");
  const [role, setRole] = React.useState("Field Operator");
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Profile"
        title="Operator Profile"
        description="Steel-grey panels with angular edit fields for field identity."
      />

      <MobileAngularCard>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
          Identity
        </p>
        <p className="mt-2 text-sm text-[#c8c8c8]">
          userId: 1 · companyId: {companyId} · timestamp synced on save
        </p>
      </MobileAngularCard>

      <MobileAngularCard className="space-y-3 bg-[linear-gradient(145deg,#222_0%,#171717_100%)]">
        <VeriForgeTextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <VeriForgeTextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <VeriForgeTextField
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <VeriForgeTextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <VeriForgeButton className="w-full" onClick={save}>
          {saved ? "Profile Forged" : "Save Profile"}
        </VeriForgeButton>
      </MobileAngularCard>

      <div className="grid gap-2">
        <Link
          href={`${VERIFORGE_MOBILE_BASE}/notifications`}
          className="border border-[#424242] bg-[#1A1A1A] px-4 py-3 text-center text-xs uppercase tracking-[0.12em] text-[#d0d0d0]"
        >
          Notifications
        </Link>
        <Link
          href={`${VERIFORGE_MOBILE_BASE}/compliance`}
          className="border border-[#424242] bg-[#1A1A1A] px-4 py-3 text-center text-xs uppercase tracking-[0.12em] text-[#d0d0d0]"
        >
          Compliance Vault
        </Link>
        <Link
          href={`${VERIFORGE_MOBILE_BASE}/auth/login`}
          className="border border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] px-4 py-3 text-center text-xs uppercase tracking-[0.12em] text-[#ffc9c9]"
        >
          Sign Out
        </Link>
      </div>
    </div>
  );
}
