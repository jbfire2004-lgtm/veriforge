"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ReportingDashboardClient } from "@/components/reporting/ReportingDashboardClient";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { getInspectionReport } from "@/lib/api/reporting";

export default function InspectionReportingPage() {
  const load = useCallback(
    (p: { companyId?: number }) => getInspectionReport(p.companyId),
    [],
  );

  return (
    <AdminPageShell
      title="Inspection status"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Inspections" },
      ]}
      actions={
        <Link href="/admin/inspections" className="text-sm text-teal-600 hover:underline">
          Inspection module
        </Link>
      }
    >
      <ReportingDashboardClient
        title="Inspection report"
        load={load}
        renderStats={(d) => [
          { label: "Total", value: d.summary.totalInspections },
          { label: "Passed", value: d.summary.passed },
          { label: "Failed", value: d.summary.failed, warn: true },
          { label: "Due ≤7 days", value: d.summary.dueWithin7Days, warn: true },
          { label: "Pass rate", value: `${d.summary.passRate}%` },
        ]}
        renderChart={(d) => ({ chart: d.chart, title: "Inspection outcomes" })}
        renderTable={(d) => (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent inspections</CardTitle>
              <Link href="/admin/inspections" className="text-sm text-teal-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(d.recent as { id: number; inspectionType: string; passed: boolean | null; equipment?: { id: number; name: string } }[]).map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        {i.equipment ? (
                          <Link
                            href={`/admin/equipment/${i.equipment.id}`}
                            className="text-teal-600 hover:underline"
                          >
                            {i.equipment.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{i.inspectionType}</TableCell>
                      <TableCell>
                        <Badge variant={i.passed ? "success" : i.passed === false ? "danger" : "outline"}>
                          {i.passed == null ? "Pending" : i.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      />
    </AdminPageShell>
  );
}
