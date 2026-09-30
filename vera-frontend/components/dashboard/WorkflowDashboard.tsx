import Link from "next/link";
import { Suspense } from "react";
import {
  buildQuickActions,
  shouldShowMetrics,
  shouldShowRecentActivity,
} from "@/lib/navigation/dashboard-config";
import { isWorker } from "@/lib/phase1-roles";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";
import {
  Card,
  CardContent,
  buttonStyles,
} from "@/components/ui";
import { DashboardRealtimeProvider } from "./engine/DashboardRealtimeProvider";
import { DashboardWidgetEngine } from "./engine/DashboardWidgetEngine";
import { DashboardQuickActionsPanel } from "./DashboardQuickActionsPanel";
import { MetricsGrid, MetricsGridSkeleton } from "./MetricsGrid";
import { RecentActivityCard, RecentActivitySkeleton } from "./RecentActivityCard";

type Props = {
  role: string | null;
  userName?: string | null;
  companyId?: number;
  unionHallId?: number;
};

export async function WorkflowDashboard({
  role,
  userName,
  companyId,
  unionHallId,
}: Props) {
  const worker = isWorker(role);
  const showMetrics = shouldShowMetrics(role);
  const showActivity = shouldShowRecentActivity(role);
  const hasQuickActions = buildQuickActions(role).length > 0;

  if (worker) {
    return (
      <div className="space-y-vera-8">
        <VeraPageHeader
          variant="workspace"
          eyebrow="Worker"
          title={userName ? `Hello, ${userName}` : "Your wallet"}
          description="View your training, credentials, and site assignments."
        />
        <Card className="border-vera-charcoal/10 shadow-sm">
          <CardContent className="flex flex-col items-start gap-vera-4 pt-vera-8">
            <p className="text-sm text-vera-muted">
              Open your wallet to see verified training and compliance status.
            </p>
            <Link href="/wallet" className={buttonStyles({ variant: "teal" })}>
              Open worker wallet
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardRealtimeProvider>
      <div className="space-y-vera-8 pb-20 lg:pb-vera-8">
        <VeraPageHeader
          variant="workspace"
          eyebrow="Operations"
          title="Dashboard"
          description="Workflow hub — compliance, readiness, training, and role-specific operations."
        />

        {showMetrics ? (
          <Suspense fallback={<MetricsGridSkeleton />}>
            <MetricsGrid />
          </Suspense>
        ) : null}

        <DashboardWidgetEngine role={role} companyId={companyId} unionHallId={unionHallId} />

        {showActivity ? (
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivityCard />
          </Suspense>
        ) : null}

        {hasQuickActions ? <DashboardQuickActionsPanel role={role} /> : null}
      </div>
    </DashboardRealtimeProvider>
  );
}
