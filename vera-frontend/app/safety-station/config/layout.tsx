import { canManageSafetyStations } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function SafetyStationConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      callbackUrl="/safety-station/config"
      guard={canManageSafetyStations}
    >
      {children}
    </WorkspaceShell>
  );
}
