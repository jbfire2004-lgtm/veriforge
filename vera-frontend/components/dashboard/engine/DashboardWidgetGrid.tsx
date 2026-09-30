import * as React from "react";
import { cn } from "@/src/lib/utils";
import { DashboardGrid } from "@/components/vera-core/dashboard";
import type { WidgetPlacement } from "@/lib/dashboard/types";

export type DashboardWidgetGridProps = {
  placements: WidgetPlacement[];
  children: React.ReactNode;
  className?: string;
};

/**
 * Responsive widget grid with optional 2-column span on desktop (§2, §7).
 */
export function DashboardWidgetGrid({
  placements,
  children,
  className,
}: DashboardWidgetGridProps) {
  const childArray = React.Children.toArray(children);
  const dataPlacements = placements.filter(
    (p) => p.id !== "quickActions" && p.id !== "metrics" && p.id !== "recentActivity"
  );

  return (
    <DashboardGrid columns={3} className={className}>
      {dataPlacements.map((placement, index) => {
        const child = childArray[index];
        if (!child) return null;
        return (
          <div
            key={placement.id}
            className={cn(
              placement.colSpan === 2 && "sm:col-span-2 lg:col-span-2",
              placement.collapseOnMobile && "hidden sm:block"
            )}
          >
            {child}
          </div>
        );
      })}
    </DashboardGrid>
  );
}
