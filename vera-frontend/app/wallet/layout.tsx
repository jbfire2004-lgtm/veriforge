import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell callbackUrl="/wallet">{children}</WorkspaceShell>;
}
