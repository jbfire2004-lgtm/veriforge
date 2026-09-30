import { canAccessTrainingProviderDashboard } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function TrainingProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      callbackUrl="/training-provider"
      guard={canAccessTrainingProviderDashboard}
    >
      {children}
    </WorkspaceShell>
  );
}
