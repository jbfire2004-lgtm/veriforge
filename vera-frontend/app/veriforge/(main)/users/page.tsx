import Link from "next/link";
import { VeriForgeButton, VeriForgeContentBlock, VeriForgeTable } from "@/components/veriforge";

const users = [
  { id: "u-101", name: "Maya Ironwood", role: "Supervisor", status: "Active" },
  { id: "u-102", name: "Dylan Forge", role: "Trainer", status: "Active" },
  { id: "u-103", name: "Rhea Calder", role: "Auditor", status: "Review" },
];

export default function VeriForgeUsersListPage() {
  return (
    <div className="space-y-[var(--vf-spacing-md)]">
      <VeriForgeContentBlock
        title="Users / List"
        description="Industrial user roster with detail and edit flow routing."
      >
        <VeriForgeTable
          columns={[
            { key: "name", header: "Name" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            {
              key: "id",
              header: "Actions",
              render: (value) => (
                <div className="flex gap-2">
                  <Link href={`/veriforge/users/${String(value)}`}>
                    <VeriForgeButton size="sm" variant="secondary">
                      Detail
                    </VeriForgeButton>
                  </Link>
                  <Link href={`/veriforge/users/${String(value)}/edit`}>
                    <VeriForgeButton size="sm" variant="ghost">
                      Edit
                    </VeriForgeButton>
                  </Link>
                </div>
              ),
            },
          ]}
          rows={users}
          rowKey={(row) => row.id}
        />
      </VeriForgeContentBlock>
    </div>
  );
}

