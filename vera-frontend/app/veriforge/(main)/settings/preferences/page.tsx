"use client";

import * as React from "react";
import {
  VeriForgeButton,
  VeriForgeCheckbox,
  VeriForgeContentBlock,
  VeriForgeToggle,
} from "@/components/veriforge";

export default function VeriForgeSettingsPreferencesPage() {
  const [highContrast, setHighContrast] = React.useState(true);

  return (
    <VeriForgeContentBlock
      title="Settings / Preferences"
      description="Preference controls with red active states and steel disabled cues."
    >
      <form className="space-y-[var(--vf-spacing-md)]">
        <VeriForgeToggle
          label="High-contrast mode"
          checked={highContrast}
          onCheckedChange={setHighContrast}
        />
        <VeriForgeCheckbox label="Enable verification pulse alerts" defaultChecked />
        <VeriForgeCheckbox label="Enable mobile escalation prompts" />
        <VeriForgeButton type="submit">Save Preferences</VeriForgeButton>
      </form>
    </VeriForgeContentBlock>
  );
}

