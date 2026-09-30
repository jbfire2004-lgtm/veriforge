import { VeriForgeContentBlock, VeriForgeTable } from "@/components/veriforge";

const rows = [
  { id: "m-1", module: "Lockout-Tagout", completion: "97%", status: "Certified" },
  { id: "m-2", module: "High-Heat Response", completion: "82%", status: "In Progress" },
  { id: "m-3", module: "Heavy Lift Safety", completion: "100%", status: "Certified" },
];

export default function VeriForgeTrainingProgressPage() {
  return (
    <VeriForgeContentBlock
      title="Training / Progress"
      description="Table-driven completion tracking with angular industrial styling."
    >
      <VeriForgeTable
        columns={[
          { key: "module", header: "Module" },
          { key: "completion", header: "Completion" },
          { key: "status", header: "Status" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
      />
    </VeriForgeContentBlock>
  );
}

