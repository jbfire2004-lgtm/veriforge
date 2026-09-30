"use client";

import { VeriForgeButton, VeriForgeContentBlock, VeriForgeTextField } from "@/components/veriforge";

export default function VeriForgeSettingsProfilePage() {
  return (
    <VeriForgeContentBlock title="Settings / Profile" description="Industrial profile controls and identity metadata.">
      <form className="space-y-[var(--vf-spacing-md)]">
        <VeriForgeTextField label="Display Name" defaultValue="VeriForge Supervisor" />
        <VeriForgeTextField label="Email" defaultValue="supervisor@veriforge.io" />
        <VeriForgeTextField label="Team" defaultValue="North Forge" />
        <VeriForgeButton type="submit">Save Profile</VeriForgeButton>
      </form>
    </VeriForgeContentBlock>
  );
}

