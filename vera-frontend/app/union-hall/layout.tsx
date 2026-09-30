import { requireRouteAccess } from "@/lib/route-access";
import { canAccessUnionHallShell } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function UnionHallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell callbackUrl="/union-hall" guard={canAccessUnionHallShell}>
      {children}
    </WorkspaceShell>
  );
}
