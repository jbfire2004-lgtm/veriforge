import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell callbackUrl="/companies">{children}</WorkspaceShell>;
}
