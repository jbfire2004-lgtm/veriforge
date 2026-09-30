import { canAccessCoreTools } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { VeraAppShell } from "@/src/components/layout/VeraAppShell";
import { VeraModuleBoundary } from "@/components/vera-access/VeraModuleBoundary";
import { VeraAuthProvider } from "@/contexts/VeraAuthContext";

export default async function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRouteAccess({
    callbackUrl: "/core",
    guard: canAccessCoreTools,
  });

  return (
    <VeraAppShell
      variant="core"
      role={role}
      userName={session.user?.name ?? null}
      userEmail={session.user?.email ?? null}
    >
      <VeraAuthProvider initialAccessToken={session.accessToken ?? null}>
        <VeraModuleBoundary moduleId="core" moduleName="Vera Core" optimistic>
          {children}
        </VeraModuleBoundary>
      </VeraAuthProvider>
    </VeraAppShell>
  );
}
