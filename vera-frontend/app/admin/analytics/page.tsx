"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
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

type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;

type IncidentRow = {
  id: number;
  severity?: IncidentSeverity | null;
  type?: string | null;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  createdAt: string;
};

export default function AdminAnalyticsPage() {
  const [incidents, setIncidents] = useState<IncidentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await apiGet<IncidentRow[]>("/incident");
        if (!cancelled) {
          setIncidents(rows);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setIncidents([]);
          setError(e instanceof Error ? e.message : "Could not load incidents.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = incidents === null;
  const incidentCount = incidents?.length ?? 0;
  const highSeverityCount =
    incidents?.filter((x) => x.severity === "HIGH" || x.severity === "CRITICAL")
      .length ?? 0;
  const recentIncidents = incidents?.slice(0, 5) ?? [];

  return (
    <AdminPageShell
      title="Analytics"
      description="High-level incident counts from the reporting API."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Analytics" },
      ]}
      actions={
        <Link
          href="/admin/incidents/analytics"
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Incident charts
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-vera-4 md:grid-cols-3">
        {(
          [
            { label: "Total incidents", value: incidentCount },
            { label: "High / critical", value: highSeverityCount },
            { label: "Recent sample", value: recentIncidents.length },
          ] as const
        ).map(({ label, value }) => (
          <Card key={label} className="border-vera-charcoal/10">
            <CardHeader className="pb-vera-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-vera-muted">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p className="text-3xl font-bold tabular-nums text-vera-deep">
                  {value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Recent incidents</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {error != null ? (
            <div className="px-vera-6">
              <ErrorState
                title="Could not load incidents"
                description={error}
              />
            </div>
          ) : loading ? (
            <div className="space-y-vera-2 px-vera-6">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : recentIncidents.length === 0 ? (
            <p className="px-vera-6 text-sm text-vera-muted">No incidents.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-medium">
                      {inc.type ?? inc.category ?? inc.title ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-vera-muted">
                      {new Date(inc.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-vera-charcoal">
                      {inc.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
