import { canAccessCoreTools } from "@/lib/phase1-roles";
import { requireRouteAccess, type RouteGuard } from "@/lib/route-access";
import { VeraAppShell, type VeraAppShellProps } from "./VeraAppShell";

export type WorkspaceShellProps = {
  children: React.ReactNode;
  callbackUrl: string;
  /** Override the access guard. Defaults to `canAccessCoreTools` (any staff). */
  guard?: RouteGuard;
  /** Shell variant — defaults to `workspace`. */
  variant?: VeraAppShellProps["variant"];
  /** Optional page-header slot forwarded to `<AppLayout>`. */
  pageHeader?: React.ReactNode;
};

/**
 * Shared server-rendered wrapper for the authenticated workspace surfaces
 * (`/dashboard`, `/wallet`, `/companies`, `/workers`, …). Centralises the
 * sign-in redirect, the role guard, and the app chrome so every workspace
 * layout reduces to a single call.
 */
export async function WorkspaceShell({
  children,
  callbackUrl,
  guard = canAccessCoreTools,
  variant = "workspace",
  pageHeader,
}: WorkspaceShellProps) {
  const { session, role } = await requireRouteAccess({ callbackUrl, guard });
  return (
    <VeraAppShell
      variant={variant}
      role={role}
      userName={session.user?.name ?? null}
      userEmail={session.user?.email ?? null}
      pageHeader={pageHeader}
    >
      {children}
    </VeraAppShell>
  );
}
