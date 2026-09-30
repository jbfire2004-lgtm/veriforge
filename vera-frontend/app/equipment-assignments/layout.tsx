import { canManageEquipmentAssignments } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function EquipmentAssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      callbackUrl="/equipment-assignments"
      guard={canManageEquipmentAssignments}
    >
      {children}
    </WorkspaceShell>
  );
}
