import { VeriForgeContentBlock, VeriForgeWarningCard } from "@/components/veriforge";

export default function VeriForgeVerificationWorkflowsPage() {
  return (
    <VeriForgeContentBlock
      title="Verification / Workflows"
      description="Angular workflow rail for checks, approvals, and closure."
    >
      <div className="grid gap-[var(--vf-spacing-md)] md:grid-cols-3">
        <VeriForgeWarningCard title="Stage 01" message="Capture field evidence and identity assertions." />
        <VeriForgeWarningCard title="Stage 02" message="Supervisor validates constraints and signs response." />
        <VeriForgeWarningCard title="Stage 03" message="System closes chain with immutable audit stamp." />
      </div>
    </VeriForgeContentBlock>
  );
}

