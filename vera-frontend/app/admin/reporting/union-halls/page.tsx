"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ReportingDashboardClient } from "@/components/reporting/ReportingDashboardClient";
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
import { getUnionDispatchReport } from "@/lib/api/reporting";

export default function UnionDispatchReportingPage() {
  const load = useCallback(
    (p: {
      companyId?: number;
      unionHallId?: number;
      from?: string;
      to?: string;
    }) => getUnionDispatchReport(p),
    [],
  );

  return (
    <AdminPageShell
      title="Union hall dispatch"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Union halls" },
      ]}
      actions={
        <Link href="/union-hall" className="text-sm text-teal-600 hover:underline">
          Union hall portal
        </Link>
      }
    >
      <ReportingDashboardClient
        title="Union dispatch report"
        exportKind="union-dispatch"
        showUnionHall
        showDateRange
        load={load}
        renderStats={(d) => [
          { label: "Total dispatches", value: d.summary.totalDispatches },
          { label: "Active", value: d.summary.activeDispatches },
          { label: "Recalled", value: d.summary.recalledDispatches },
          { label: "Active members", value: d.summary.activeMembers },
        ]}
        renderChart={(d) => ({
          chart: {
            labels: d.byCompany.slice(0, 8).map((c) => c.companyName),
            values: d.byCompany.slice(0, 8).map((c) => c.count),
          },
          title: "Dispatches by company",
          bar: true,
          horizontal: true,
        })}
        renderTable={(d) => (
          <Card>
            <CardHeader>
              <CardTitle>Recent dispatches</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Hall</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Dispatched</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.recent.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link href={`/verify/${row.worker.id}`} className="text-teal-600 hover:underline">
                          {row.worker.firstName} {row.worker.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.unionHall.name}</TableCell>
                      <TableCell>
                        <Link href={`/companies/${row.company.id}`} className="hover:underline">
                          {row.company.name}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(row.dispatchedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{row.recalledAt ? "Recalled" : "Active"}</TableCell>
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
