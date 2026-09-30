import { canAccessProjectManagement } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";
import "@/src/components/safety-forms/theme/safety-forms-theme.css";
import "@/src/components/sms/design-system/theme.css";
import { PmAccessWrapper } from "./PmAccessWrapper";

export default async function PmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requireRouteAccess({
    callbackUrl: "/pm",
    guard: canAccessProjectManagement,
  });

  return (
    <WorkspaceShell callbackUrl="/pm" guard={canAccessProjectManagement}>
      <PmAccessWrapper
        initialAccessToken={session.accessToken}
        serverSessionVerified
      >
        <div className="sf-theme">{children}</div>
      </PmAccessWrapper>
    </WorkspaceShell>
  );
}
