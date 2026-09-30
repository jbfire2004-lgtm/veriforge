import { canSeeDashboardWidget } from "@/lib/navigation/role-access";
import type { DashboardWidgetId } from "@/lib/navigation/types";
import type { WidgetPlacement } from "./types";

const PLACEMENT: WidgetPlacement[] = [
  { id: "systemHealth", priority: 10, colSpan: 2 },
  { id: "workerCompliance", priority: 20 },
  { id: "equipmentCompliance", priority: 30 },
  { id: "projectReadiness", priority: 40 },
  { id: "trainingExpiry", priority: 50, colSpan: 2 },
  { id: "assignments", priority: 55 },
  { id: "unionDispatch", priority: 60 },
  { id: "providerApprovals", priority: 70 },
  { id: "metrics", priority: 80, collapseOnMobile: true },
  { id: "recentActivity", priority: 90, colSpan: 2, collapseOnMobile: true },
  { id: "quickActions", priority: 100 },
];

/**
 * Priority-ordered widget placements visible for the given role.
 * Quick actions render outside the grid (FAB on mobile).
 */
export function resolveWidgetPlacements(role: string | null): WidgetPlacement[] {
  return PLACEMENT.filter((p) => canSeeDashboardWidget(role, p.id)).sort(
    (a, b) => a.priority - b.priority
  );
}

export function gridColumnsForPlacement(count: number): 1 | 2 | 3 | 4 {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  return 3;
}

export function isDataWidget(id: DashboardWidgetId): boolean {
  return (
    id !== "quickActions" &&
    id !== "metrics" &&
    id !== "recentActivity"
  );
}
