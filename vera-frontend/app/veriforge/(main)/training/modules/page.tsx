import { VeriForgeContentBlock, VeriForgeFeatureCard } from "@/components/veriforge";

export default function VeriForgeTrainingModulesPage() {
  return (
    <VeriForgeContentBlock
      title="Training / Modules"
      description="Industrial training catalog with forged competency pathways."
    >
      <div className="grid gap-[var(--vf-spacing-md)] md:grid-cols-3">
        <VeriForgeFeatureCard title="Lockout-Tagout" summary="Critical hazard isolation and authorization." />
        <VeriForgeFeatureCard title="High-Heat Response" summary="Thermal containment and escalation workflow." />
        <VeriForgeFeatureCard title="Heavy Lift Safety" summary="Rigging, clearance, and communication protocol." />
      </div>
    </VeriForgeContentBlock>
  );
}

