"use client";

import { useCallback } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  ProjectReadinessTable,
  ReportingDashboardClient,
} from "@/components/reporting/ReportingDashboardClient";
import { getProjectReadinessReport } from "@/lib/api/reporting";

export default function ProjectReadinessReportingPage() {
  const load = useCallback(
    (p: { companyId?: number }) => getProjectReadinessReport(p.companyId),
    [],
  );

  return (
    <AdminPageShell
      title="Project readiness"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Projects" },
      ]}
    >
      <ReportingDashboardClient
        title="Project readiness report"
        exportKind="projects"
        load={load}
        renderStats={(d) => [
          { label: "Active projects", value: d.summary.totalProjects },
          { label: "Ready", value: d.summary.ready },
          { label: "At risk", value: d.summary.atRisk, warn: true },
          { label: "Not ready", value: d.summary.notReady, warn: true },
          { label: "Avg readiness", value: `${d.summary.averageReadiness}%` },
        ]}
        renderChart={(d) => ({ chart: d.chart, title: "Readiness distribution", bar: true })}
        renderTable={(d) => <ProjectReadinessTable rows={d.rows} />}
      />
    </AdminPageShell>
  );
}
