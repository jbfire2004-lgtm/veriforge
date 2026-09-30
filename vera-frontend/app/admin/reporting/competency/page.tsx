"use client";

import { useCallback } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ReportingDashboardClient } from "@/components/reporting/ReportingDashboardClient";
import { getCompetencyReport } from "@/lib/api/reporting";

export default function CompetencyReportingPage() {
  const load = useCallback(
    (p: { companyId?: number }) => getCompetencyReport(p.companyId),
    [],
  );

  return (
    <AdminPageShell
      title="Competency status"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Competency" },
      ]}
    >
      <ReportingDashboardClient
        title="Competency report"
        load={load}
        renderStats={(d) => [
          { label: "Evaluations", value: d.summary.totalEvaluations },
          { label: "Passing", value: d.summary.passing },
          { label: "Expiring soon", value: d.summary.expiringSoon, warn: true },
          { label: "Expired", value: d.summary.expired, warn: true },
          { label: "Pass rate", value: `${d.summary.passRate}%` },
        ]}
        renderChart={(d) => ({ chart: d.chart, title: "Competency breakdown" })}
      />
    </AdminPageShell>
  );
}
