"use client";

import { useMemo } from "react";
import { buildDashboardWidgets, buildQuickActions } from "./dashboard-config";
import { buildVeraSidebarNav, resolveNavHref } from "./sidebar-config";
import { canSeeNavModule } from "./role-access";
import type { NavModuleId } from "./types";

/**
 * Client hook for role-aware navigation (sidebar links, dashboard widgets, quick actions).
 */
export function useRoleNavigation(role: string | null) {
  return useMemo(
    () => ({
      sidebar: buildVeraSidebarNav(role, "workspace"),
      widgets: buildDashboardWidgets(role),
      quickActions: buildQuickActions(role),
      canSee: (module: NavModuleId) => canSeeNavModule(role, module),
      href: (module: NavModuleId) => resolveNavHref(module, role, "workspace"),
    }),
    [role]
  );
}
