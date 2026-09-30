import { canViewCombinedResults } from "@/lib/phase1-roles";
import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function CombinedResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell
      callbackUrl="/combined-results"
      guard={canViewCombinedResults}
    >
      {children}
    </WorkspaceShell>
  );
}
