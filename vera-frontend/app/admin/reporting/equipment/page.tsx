"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ReportingDashboardClient } from "@/components/reporting/ReportingDashboardClient";
import { EquipmentComplianceBadge } from "@/components/equipment/EquipmentComplianceBadge";
import {
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
import { getEquipmentComplianceReport } from "@/lib/api/reporting";

export default function EquipmentComplianceReportingPage() {
  const load = useCallback(
    (p: { companyId?: number }) => getEquipmentComplianceReport(p.companyId),
    [],
  );

  return (
    <AdminPageShell
      title="Equipment compliance"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Equipment" },
      ]}
    >
      <ReportingDashboardClient
        title="Equipment compliance report"
        exportKind="equipment"
        load={load}
        renderStats={(d) => [
          { label: "Total", value: d.summary.total },
          { label: "Compliant", value: d.summary.compliant },
          { label: "Needs attention", value: d.summary.needsAttention, warn: true },
          { label: "Non-compliant", value: d.summary.nonCompliant, warn: true },
          { label: "Locked out", value: d.summary.lockedOut, warn: true },
          { label: "Compliance rate", value: `${d.summary.complianceRate}%` },
        ]}
        renderChart={(d) => ({ chart: d.chart, title: "Fleet status" })}
        renderTable={(d) => (
          <Card>
            <CardHeader>
              <CardTitle>Assets requiring action</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.recent.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <Link href={`/admin/equipment/${e.id}`} className="text-teal-600 hover:underline">
                          {e.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <EquipmentComplianceBadge status={e.complianceStatus} />
                      </TableCell>
                      <TableCell>{e.company?.name ?? "—"}</TableCell>
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
