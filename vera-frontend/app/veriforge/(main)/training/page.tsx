import Link from "next/link";
import {
  VeriForgeButton,
  VeriForgeContentBlock,
  VeriForgeTrainingEngine,
} from "@/components/veriforge";

export default function VeriForgeTrainingPage() {
  return (
    <div className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Training Engine
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#FAFAFA]">
          Create. Assign. Deliver. Certify.
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Industrial training lifecycle with module creation, assignment, delivery, scoring,
          certification, and forged-metal analytics.
        </p>
      </header>

      <VeriForgeContentBlock
        title="Legacy Training Rails"
        description="Quick links to module catalog and progress views."
      >
        <div className="flex flex-wrap gap-[var(--vf-spacing-sm)]">
          <Link href="/veriforge/training/modules">
            <VeriForgeButton>Training Modules</VeriForgeButton>
          </Link>
          <Link href="/veriforge/training/progress">
            <VeriForgeButton variant="secondary">Training Progress</VeriForgeButton>
          </Link>
        </div>
      </VeriForgeContentBlock>

      <VeriForgeTrainingEngine />
    </div>
  );
}
