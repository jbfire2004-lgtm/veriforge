import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default function ContractorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell callbackUrl="/contractor" variant="workspace">
      {children}
    </WorkspaceShell>
  );
}
