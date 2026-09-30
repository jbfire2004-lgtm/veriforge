import { canManageSiteContacts } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function SiteContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell callbackUrl="/site-contacts" guard={canManageSiteContacts}>
      {children}
    </WorkspaceShell>
  );
}
