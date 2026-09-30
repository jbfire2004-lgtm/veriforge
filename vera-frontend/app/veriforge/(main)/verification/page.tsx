import Link from "next/link";
import { VeriForgeButton, VeriForgeContentBlock } from "@/components/veriforge";

export default function VeriForgeVerificationPage() {
  return (
    <VeriForgeContentBlock
      title="Verification"
      description="Checks and workflow orchestration for industrial safety controls."
    >
      <div className="flex flex-wrap gap-[var(--vf-spacing-sm)]">
        <Link href="/veriforge/verification/checks">
          <VeriForgeButton>Verification Checks</VeriForgeButton>
        </Link>
        <Link href="/veriforge/verification/workflows">
          <VeriForgeButton variant="secondary">Workflow Engine</VeriForgeButton>
        </Link>
      </div>
    </VeriForgeContentBlock>
  );
}

