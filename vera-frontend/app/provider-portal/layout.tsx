import { canAccessProviderPortal } from "@/lib/training-provider-permissions";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function ProviderPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell callbackUrl="/provider-portal" guard={canAccessProviderPortal}>
      {children}
    </WorkspaceShell>
  );
}
