"use client";

import { VeriPmHomeDashboardView } from "@/components/veripm-home-dashboard/VeriPmHomeDashboardView";

/**
 * VeriPM landing — dashboard-first safety hub (project / company / subcontractor).
 */
export default function ProjectManagementHubPage(_props: {
  showAdminProjects?: boolean;
}) {
  return <VeriPmHomeDashboardView />;
}
