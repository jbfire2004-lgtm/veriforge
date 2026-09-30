"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ReportStatGrid } from "@/components/reporting/ReportStatGrid";
import { ReportingFilters, filtersToParams, type ReportingFilterValues } from "@/components/reporting/ReportingFilters";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  getCompaniesReadinessList,
  getCompanyReadinessReport,
  type CompanyReadinessReport,
} from "@/lib/api/reporting";

export default function CompanyReadinessReportingPage() {
  const [filters, setFilters] = useState<ReportingFilterValues>({
    companyId: "",
    unionHallId: "",
    from: "",
    to: "",
  });
  const [detail, setDetail] = useState<CompanyReadinessReport | null>(null);
  const [list, setList] = useState<
    { companyId: number; companyName: string; workerCount: number; equipmentComplianceRate: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = filtersToParams(filters);
        if (params.companyId) {
          const d = await getCompanyReadinessReport(params.companyId);
          if (!cancelled) {
            setDetail(d);
            setList([]);
          }
        } else {
          const l = await getCompaniesReadinessList();
          if (!cancelled) {
            setDetail(null);
            setList(l.rows);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <AdminPageShell
      title="Company readiness"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reporting", href: "/admin/reporting" },
        { label: "Companies" },
      ]}
    >
      <section className="space-y-6">
        <ReportingFilters values={filters} onChange={setFilters} />
        {loading && <Skeleton className="h-40 w-full rounded-xl" />}
        {!loading && error && <ErrorState title="Unavailable" description={error} />}

        {!loading && !error && detail && (
          <>
            <header className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{detail.company.name}</h2>
              <Badge
                variant={
                  detail.readinessStatus === "READY"
                    ? "success"
                    : detail.readinessStatus === "AT_RISK"
                      ? "outline"
                      : "danger"
                }
              >
                {detail.overallScore}% · {detail.readinessStatus.replace("_", " ")}
              </Badge>
              <Link href={`/companies/${detail.company.id}`} className="text-sm text-teal-600 hover:underline">
                Company profile
              </Link>
            </header>
            <ReportStatGrid
              stats={[
                { label: "Worker compliance", value: `${detail.workers.complianceRate}%` },
                { label: "Equipment compliance", value: `${detail.equipment.complianceRate}%` },
                { label: "Inspection pass rate", value: `${detail.inspections.passRate}%` },
                { label: "Project readiness", value: `${detail.projects.averageReadiness}%` },
              ]}
            />
          </>
        )}

        {!loading && !error && !detail && (
          <Card>
            <CardHeader>
              <CardTitle>Companies — enter a company ID for full drill-down</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Workers</TableHead>
                    <TableHead>Equipment compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((c) => (
                    <TableRow key={c.companyId}>
                      <TableCell>
                        <Link href={`/companies/${c.companyId}`} className="text-teal-600 hover:underline">
                          {c.companyName}
                        </Link>
                      </TableCell>
                      <TableCell>{c.workerCount}</TableCell>
                      <TableCell>{c.equipmentComplianceRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </AdminPageShell>
  );
}
