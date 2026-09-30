import { canManageSafetyStations } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function SafetyStationHardwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      callbackUrl="/safety-station/hardware"
      guard={canManageSafetyStations}
    >
      {children}
    </WorkspaceShell>
  );
}
