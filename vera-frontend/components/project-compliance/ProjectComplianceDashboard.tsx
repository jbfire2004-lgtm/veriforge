"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserX,
} from "lucide-react";
import {
  fetchProjectCompliance,
  fetchProjectComplianceAlerts,
  resolveProjectComplianceAlert,
  type ComplianceAlertRow,
  type ProjectComplianceReport,
} from "@/lib/project-compliance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Skeleton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { ProjectDashboardView } from "@/components/vera-core-ui";
import { CoreMetricTile } from "@/components/vera-core-ui/CoreMetricTile";
import { CoreSection } from "@/components/vera-core-ui/CoreSection";
import { CoreDashboardGrid } from "@/components/vera-core-ui/CoreDashboardGrid";
import { ComplianceBadge } from "@/components/vera-core-ui/ComplianceBadge";

type Props = {
  companyId: number;
  projectId: number;
  workerDetailBasePath?: string;
};

function gapTone(status: string) {
  if (status === "expired" || status === "missing") return "non_compliant" as const;
  if (status === "expiring_soon") return "at_risk" as const;
  return "ok" as const;
}

export function ProjectComplianceDashboard({
  companyId,
  projectId,
  workerDetailBasePath = `/companies/${companyId}/projects/${projectId}/workers`,
}: Props) {
  const [report, setReport] = useState<ProjectComplianceReport | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlertRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [compliance, alertRows] = await Promise.all([
        fetchProjectCompliance(projectId),
        fetchProjectComplianceAlerts(projectId),
      ]);
      setReport(compliance);
      setAlerts(alertRows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load project compliance.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleResolve(alertId: number) {
    setResolvingId(alertId);
    try {
      await resolveProjectComplianceAlert(projectId, alertId);
      await load();
    } finally {
      setResolvingId(null);
    }
  }

  const expiring = report?.missingOrExpiring.filter((g) => g.status === "expiring_soon") ?? [];
  const allWorkers = report
    ? report.compliantWorkers.concat(report.nonCompliantWorkers)
    : [];

  if (error) {
    return <ErrorState title="Project compliance unavailable" description={error} />;
  }

  if (loading || !report) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }
  const dashboardRows = report.nonCompliantWorkers.flatMap((w) =>
    w.gaps.map((g) => ({
      id: g.credentialId ?? g.ruleId,
      workerName: w.workerName,
      certification: g.certificationName,
      bucket: g.status === "expired" ? ("Rejected" as const) : ("Pending" as const),
      expiresAt: g.expiresAt,
    })),
  );

  return (
    <div className="space-y-vera-6">
      <ProjectDashboardView
        companyId={companyId}
        projectId={projectId}
        projectName={report.projectName}
        companyName={report.client ?? undefined}
        readinessScore={report.compliancePercentage}
        verified={report.compliantWorkers.length}
        pending={report.nonCompliantWorkers.length}
        rejected={report.nonCompliantWorkers.filter((w) =>
          w.gaps.some((g) => g.status === "expired"),
        ).length}
        expiring={expiring.length}
        rows={dashboardRows}
      />

      <CoreSection title="Compliance overview">
        <CoreDashboardGrid columns={4}>
          <CoreMetricTile
            label="Compliance"
            value={`${report.compliancePercentage}%`}
            icon={CheckCircle2}
            compliance={
              report.compliancePercentage >= 90
                ? "ok"
                : report.compliancePercentage >= 70
                  ? "at_risk"
                  : "non_compliant"
            }
          />
          <CoreMetricTile
            label="Compliant workers"
            value={report.compliantWorkers.length}
            icon={CheckCircle2}
            compliance="ok"
          />
          <CoreMetricTile
            label="Non-compliant"
            value={report.nonCompliantWorkers.length}
            icon={UserX}
            compliance="non_compliant"
          />
          <CoreMetricTile
            label="Expiring soon"
            value={expiring.length}
            icon={Clock}
            compliance="at_risk"
          />
        </CoreDashboardGrid>
      </CoreSection>

      <div className="grid gap-vera-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-vera-coral" aria-hidden />
              Non-compliant workers
            </CardTitle>
            <CardDescription>Blocking gaps by worker and rule.</CardDescription>
          </CardHeader>
          <CardContent>
            {report.nonCompliantWorkers.length === 0 ? (
              <p className="text-sm text-vera-muted">All assigned workers are compliant.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.nonCompliantWorkers.flatMap((w) =>
                    w.gaps.map((g) => (
                      <TableRow key={`${w.workerId}-${g.ruleId}`}>
                        <TableCell>
                          <Link
                            href={`${workerDetailBasePath}/${w.workerId}`}
                            className="font-medium hover:text-vera-teal hover:underline"
                          >
                            {w.workerName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{g.reason}</TableCell>
                        <TableCell>
                          <ComplianceBadge state={gapTone(g.status)} />
                        </TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-vera-amber" aria-hidden />
              Expiring soon
            </CardTitle>
            <CardDescription>Credentials expiring within 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {expiring.length === 0 ? (
              <p className="text-sm text-vera-muted">No credentials expiring soon.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {allWorkers
                  .flatMap((w) =>
                    w.expiringSoon.map((g) => (
                      <li key={`${w.workerId}-${g.ruleId}-exp`} className="flex justify-between gap-2">
                        <Link
                          href={`${workerDetailBasePath}/${w.workerId}`}
                          className="font-medium hover:text-vera-teal hover:underline"
                        >
                          {w.workerName}
                        </Link>
                        <span className="text-vera-muted">
                          {g.certificationName}
                          {g.expiresAt ? ` · ${new Date(g.expiresAt).toLocaleDateString()}` : ""}
                        </span>
                      </li>
                    )),
                  )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-vera-amber" aria-hidden />
            Alerts
          </CardTitle>
          <CardDescription>
            Open compliance alerts for this project. Updated{" "}
            {new Date(report.evaluatedAt).toLocaleString()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-vera-muted">No open alerts.</p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Credential</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`${workerDetailBasePath}/${a.workerId}`}
                        className="font-medium hover:text-vera-teal hover:underline"
                      >
                        {a.workerName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        tone={
                          a.type === "EXPIRING_SOON"
                            ? "warn"
                            : a.type === "EXPIRED"
                              ? "bad"
                              : "neutral"
                        }
                        subtle
                      >
                        {a.type.replace("_", " ")}
                      </StatusPill>
                    </TableCell>
                    <TableCell>{a.certificationName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-vera-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className={`${buttonStyles({ variant: "outline", size: "sm" })} min-h-11 min-w-[5.5rem]`}
                        disabled={resolvingId === a.id}
                        aria-label={`Resolve compliance alert for ${a.workerName}`}
                        onClick={() => void handleResolve(a.id)}
                      >
                        Resolve
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
