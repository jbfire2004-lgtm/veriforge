import { VeriForgeAlert, VeriForgeContentBlock, VeriForgeTable } from "@/components/veriforge";

const checks = [
  { id: "c-14", item: "Permit Integrity", outcome: "Pass", owner: "Supervisor" },
  { id: "c-15", item: "PPE Validation", outcome: "Pass", owner: "Safety Lead" },
  { id: "c-16", item: "Thermal Tolerance", outcome: "Fail", owner: "Control Room" },
];

export default function VeriForgeVerificationChecksPage() {
  return (
    <div className="space-y-[var(--vf-spacing-md)]">
      <VeriForgeAlert
        tone="critical"
        title="CHECK ESCALATION"
        message="One verification item breached tolerance. Review workflow immediately."
      />
      <VeriForgeContentBlock title="Verification / Checks" description="Inspectable check outcomes and ownership.">
        <VeriForgeTable
          columns={[
            { key: "item", header: "Check Item" },
            { key: "outcome", header: "Outcome" },
            { key: "owner", header: "Owner" },
          ]}
          rows={checks}
          rowKey={(row) => row.id}
        />
      </VeriForgeContentBlock>
    </div>
  );
}

