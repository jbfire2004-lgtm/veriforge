"use client";

import * as React from "react";
import { VeriForgeButton, VeriForgeContentBlock, VeriForgeSelect, VeriForgeTextField } from "@/components/veriforge";

export default function VeriForgeUserEditPage() {
  return (
    <div className="space-y-[var(--vf-spacing-md)]">
      <VeriForgeContentBlock title="Users / Edit" description="Angular edit form with forged-metal field states.">
        <form className="space-y-[var(--vf-spacing-md)]">
          <VeriForgeTextField label="Full Name" defaultValue="Maya Ironwood" />
          <VeriForgeTextField label="Email" defaultValue="maya.ironwood@veriforge.io" />
          <VeriForgeSelect
            label="Role"
            defaultValue="supervisor"
            options={[
              { label: "Supervisor", value: "supervisor" },
              { label: "Trainer", value: "trainer" },
              { label: "Auditor", value: "auditor" },
            ]}
          />
          <div className="flex gap-[var(--vf-spacing-sm)]">
            <VeriForgeButton type="submit">Save Profile</VeriForgeButton>
            <VeriForgeButton type="button" variant="ghost">
              Cancel
            </VeriForgeButton>
          </div>
        </form>
      </VeriForgeContentBlock>
    </div>
  );
}

