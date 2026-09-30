import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function WorkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell callbackUrl="/workers">{children}</WorkspaceShell>;
}
