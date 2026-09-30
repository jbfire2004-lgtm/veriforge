import { Suspense } from "react";
import { isDataWidget, resolveWidgetPlacements } from "@/lib/dashboard/placement-rules";
import { loadDashboardWidgetsBundle } from "@/lib/dashboard/widgets-api";
import { SkeletonLoader } from "@/components/vera-core/utility";
import { DashboardWidgetGrid } from "./DashboardWidgetGrid";
import { renderDataWidget } from "../widgets/WidgetPanels";

type Props = {
  role: string | null;
  companyId?: number;
  unionHallId?: number;
};

async function WidgetDataSection({ role, companyId, unionHallId }: Props) {
  const placements = resolveWidgetPlacements(role).filter((p) => isDataWidget(p.id));
  const res = await loadDashboardWidgetsBundle({ companyId, unionHallId });

  if (!res.ok) {
    return (
      <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
        Unable to load dashboard widgets. Check your connection and try again.
      </p>
    );
  }

  const bundle = res.data;
  const widgets = placements
    .map((p) => {
      const panel = renderDataWidget(p.id, bundle, role);
      if (!panel) return null;
      return panel;
    })
    .filter(Boolean);

  if (widgets.length === 0) return null;

  return (
    <DashboardWidgetGrid placements={placements.filter((p) => isDataWidget(p.id))}>
      {widgets}
    </DashboardWidgetGrid>
  );
}

function WidgetSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <SkeletonLoader key={i} className="h-40 rounded-[var(--radius-md)]" />
      ))}
    </div>
  );
}

export function DashboardWidgetEngine(props: Props) {
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <WidgetDataSection {...props} />
    </Suspense>
  );
}
