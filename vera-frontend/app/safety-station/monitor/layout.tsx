import { canManageSafetyStations } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function SafetyStationMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      callbackUrl="/safety-station/monitor"
      guard={canManageSafetyStations}
    >
      {children}
    </WorkspaceShell>
  );
}
