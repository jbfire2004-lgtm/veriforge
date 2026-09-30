import Link from "next/link";
import { VeriForgeButton, VeriForgeContentBlock } from "@/components/veriforge";

export default function VeriForgeSettingsPage() {
  return (
    <VeriForgeContentBlock
      title="Settings"
      description="Profile and preference architecture with consistent tokenized styling."
    >
      <div className="flex flex-wrap gap-[var(--vf-spacing-sm)]">
        <Link href="/veriforge/settings/profile">
          <VeriForgeButton>Profile</VeriForgeButton>
        </Link>
        <Link href="/veriforge/settings/preferences">
          <VeriForgeButton variant="secondary">Preferences</VeriForgeButton>
        </Link>
      </div>
    </VeriForgeContentBlock>
  );
}

