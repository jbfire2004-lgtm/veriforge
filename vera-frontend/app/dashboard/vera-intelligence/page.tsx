import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { resolveDashboardScope } from "@/lib/dashboard/resolve-dashboard-scope";
import { IntelligenceCommandStack } from "@/components/dashboard/IntelligenceCommandStack";
import { canAccessVeraIntelligenceStack } from "@/lib/navigation/vera-intelligence-access";
import { sessionRole } from "@/lib/phase1-roles";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";
import { Card, CardContent } from "@/components/ui";

export default async function VeraIntelligencePage() {
  const session = await getServerSession(authOptions);
  const role = sessionRole(session);

  if (!canAccessVeraIntelligenceStack(role)) {
    redirect("/forbidden?from=/dashboard/vera-intelligence");
  }

  const scope = await resolveDashboardScope(session);

  return (
    <div className="space-y-vera-8 pb-20 lg:pb-vera-8">
      <VeraPageHeader
        eyebrow="Future ecosystem"
        title="Vera intelligence stack"
        description="AI command layers, civilization, interstellar, and interplanetary engines — preview and down-the-road capabilities, scoped to your company."
      />

      {scope.companyId != null ? (
        <IntelligenceCommandStack
          companyId={scope.companyId}
          unionHallId={scope.unionHallId}
        />
      ) : (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-vera-6 text-sm text-vera-muted">
            Intelligence layers need a company context. Add a company or sign in as an admin with
            access to companies.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
