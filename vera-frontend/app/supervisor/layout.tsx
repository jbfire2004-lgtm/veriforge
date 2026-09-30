import { canAccessSupervisorShell } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { VeraAppShell } from "@/src/components/layout/VeraAppShell";

export default async function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRouteAccess({
    callbackUrl: "/supervisor",
    guard: canAccessSupervisorShell,
  });

  return (
    <VeraAppShell
      variant="supervisor"
      role={role}
      userName={session.user?.name ?? null}
      userEmail={session.user?.email ?? null}
    >
      {children}
    </VeraAppShell>
  );
}
