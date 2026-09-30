"use client";

import { useCallback } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  ReportingDashboardClient,
  WorkerComplianceTable,
} from "@/components/reporting/ReportingDashboardClient";
import { getWorkerComplianceReport } from "@/lib/api/reporting";

export default function WorkerComplianceReportingPage() {
  const load = useCallback(
    (p: { companyId?: number }) => getWorkerComplianceReport(p.companyId),
    [],
  );

  return (
    <AdminPageShell
      title="Worker compliance"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Workers" },
      ]}
    >
      <ReportingDashboardClient
        title="Worker compliance report"
        exportKind="workers"
        load={load}
        renderStats={(d) => [
          { label: "Total workers", value: d.summary.totalWorkers },
          { label: "Evaluated", value: d.summary.evaluated },
          { label: "Compliant", value: d.summary.compliant },
          { label: "Non-compliant", value: d.summary.nonCompliant, warn: true },
          { label: "Expiring soon", value: d.summary.expiringSoon, warn: true },
          { label: "Compliance rate", value: `${d.summary.complianceRate}%` },
        ]}
        renderChart={(d) => ({ chart: d.chart, title: "Compliance breakdown" })}
        renderTable={(d) => <WorkerComplianceTable rows={d.rows} />}
      />
    </AdminPageShell>
  );
}
