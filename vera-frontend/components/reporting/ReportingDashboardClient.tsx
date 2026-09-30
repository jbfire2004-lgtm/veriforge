"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  ReportingFilters,
  filtersToParams,
  type ReportingFilterValues,
} from "@/components/reporting/ReportingFilters";
import { ReportDonutChart, ReportBarChart } from "@/components/reporting/ReportCharts";
import { ReportStatGrid } from "@/components/reporting/ReportStatGrid";
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
import { buttonStyles } from "@/components/ui/button";
import { reportingExportUrl } from "@/lib/api/reporting";
import { apiFetch } from "@/lib/api-fetch";

type Props<T> = {
  title: string;
  exportKind?: "workers" | "equipment" | "projects" | "union-dispatch";
  showUnionHall?: boolean;
  showDateRange?: boolean;
  load: (params: ReturnType<typeof filtersToParams>) => Promise<T>;
  renderStats: (data: T) => { label: string; value: number | string; warn?: boolean }[];
  renderChart?: (data: T) => { chart: { labels: string[]; values: number[] }; title?: string; bar?: boolean; horizontal?: boolean };
  renderTable?: (data: T) => React.ReactNode;
};

const EMPTY_FILTERS: ReportingFilterValues = {
  companyId: "",
  unionHallId: "",
  from: "",
  to: "",
};

export function ReportingDashboardClient<T>({
  title,
  exportKind,
  showUnionHall,
  showDateRange,
  load,
  renderStats,
  renderChart,
  renderTable,
}: Props<T>) {
  const [filters, setFilters] = useState<ReportingFilterValues>(EMPTY_FILTERS);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await load(filtersToParams(filters));
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleExport() {
    if (!exportKind) return;
    const url = reportingExportUrl(exportKind, filtersToParams(filters));
    const res = await apiFetch(url);
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${exportKind}.csv`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {exportKind && (
          <button
            type="button"
            onClick={() => void handleExport()}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <Download className="mr-2 h-4 w-4 inline" aria-hidden />
            Export CSV
          </button>
        )}
      </header>

      <ReportingFilters
        values={filters}
        onChange={setFilters}
        showUnionHall={showUnionHall}
        showDateRange={showDateRange}
      />

      {loading && <Skeleton className="h-48 w-full rounded-xl" />}

      {!loading && error && <ErrorState title="Report unavailable" description={error} />}

      {!loading && !error && data && (
        <>
          <ReportStatGrid stats={renderStats(data)} />
          {renderChart && (() => {
            const c = renderChart(data);
            return (
              <Card>
                <CardContent className="pt-6">
                  {c.bar ? (
                    <ReportBarChart chart={c.chart} title={c.title} horizontal={c.horizontal} />
                  ) : (
                    <ReportDonutChart chart={c.chart} title={c.title} />
                  )}
                </CardContent>
              </Card>
            );
          })()}
          {renderTable?.(data)}
        </>
      )}
    </section>
  );
}

export function WorkerComplianceTable({
  rows,
}: {
  rows: {
    workerId: number;
    workerName: string;
    companyName: string | null;
    isCompliant: boolean;
    issueCount: number;
    expiringSoon: boolean;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker drill-down</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.workerId}>
                <TableCell>
                  <Link href={`/verify/${r.workerId}`} className="text-teal-600 hover:underline">
                    {r.workerName}
                  </Link>
                </TableCell>
                <TableCell>{r.companyName ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={r.isCompliant ? "success" : "danger"}>
                    {r.isCompliant ? "Compliant" : "Non-compliant"}
                  </Badge>
                  {r.expiringSoon && (
                    <Badge variant="outline" className="ml-1">
                      Expiring
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{r.issueCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ProjectReadinessTable({
  rows,
}: {
  rows: {
    projectId: number;
    projectName: string;
    companyName: string;
    readinessScore: number;
    readinessStatus: string;
    totalWorkers: number;
    compliantWorkers: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project drill-down</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Workers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.projectId}>
                <TableCell className="font-medium">{r.projectName}</TableCell>
                <TableCell>{r.companyName}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      r.readinessStatus === "READY"
                        ? "success"
                        : r.readinessStatus === "AT_RISK"
                          ? "outline"
                          : "danger"
                    }
                  >
                    {r.readinessScore}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.compliantWorkers}/{r.totalWorkers}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
