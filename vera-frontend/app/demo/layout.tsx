import { canAccessDemoSurfaces } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell callbackUrl="/demo" guard={canAccessDemoSurfaces}>
      {children}
    </WorkspaceShell>
  );
}
