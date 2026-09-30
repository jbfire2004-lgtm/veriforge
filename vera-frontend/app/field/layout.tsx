import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell callbackUrl="/field">{children}</WorkspaceShell>;
}
