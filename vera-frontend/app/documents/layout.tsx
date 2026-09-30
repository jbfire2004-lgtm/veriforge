import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell callbackUrl="/documents/completed">{children}</WorkspaceShell>
  );
}
