"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  GraduationCap,
  ShieldAlert,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import type {
  CompanyTrainingComplianceDashboard,
  TrainingComplianceBucket,
  TrainingComplianceRow,
} from "@/lib/api/companies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type StatusPillTone,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { formatShortDate, parseDate } from "@/components/wallet/worker-wallet-utils";
import { SummaryCard } from "./TrainingPanel";

const BUCKET_META: Record<
  TrainingComplianceBucket,
  { label: string; tone: "good" | "warn" | "bad" | "neutral"; icon: LucideIcon }
> = {
  verified: { label: "Verified training", tone: "good", icon: CheckCircle2 },
  pending: { label: "Pending verification", tone: "neutral", icon: Clock },
  rejected: { label: "Rejected training", tone: "bad", icon: XCircle },
  expiring: { label: "Expiring training", tone: "warn", icon: AlertTriangle },
};

function outcomeTone(outcome: string | null): StatusPillTone {
  switch ((outcome ?? "").toUpperCase()) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "NEEDS_REVIEW":
    case "PENDING":
      return "warning";
    default:
      return "neutral";
  }
}

export default function CompanyTrainingCompliancePanel({
  companyId,
}: {
  companyId: number;
}) {
  const [data, setData] = useState<CompanyTrainingComplianceDashboard | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TrainingComplianceBucket>("verified");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const dashboard = await apiGet<CompanyTrainingComplianceDashboard>(
          `/companies/${companyId}/training-compliance`
        );
        if (!cancelled) {
          setData(dashboard);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load training compliance."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.records[filter] ?? [];
  }, [data, filter]);

  if (error != null) {
    return (
      <ErrorState
        title="Training compliance unavailable"
        description={error}
      />
    );
  }

  if (data == null) {
    return (
      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardContent className="space-y-vera-3 p-vera-6">
          <Skeleton className="h-6 w-56 rounded" />
          <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-vera-5">
      <header className="space-y-vera-1">
        <h2 className="flex items-center gap-vera-2 text-xl font-medium tracking-tight text-vera-deep">
          <GraduationCap className="h-5 w-5 text-vera-teal" aria-hidden />
          Training compliance
        </h2>
        <p className="text-sm text-vera-muted">
          Auto-updated when training is uploaded from providers. Last refresh{" "}
          {formatShortDate(parseDate(data.updatedAt))}.
        </p>
      </header>

      <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(BUCKET_META) as TrainingComplianceBucket[]).map((key) => {
          const meta = BUCKET_META[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="text-left"
            >
              <SummaryCard
                icon={meta.icon}
                label={meta.label}
                value={data.counts[key]}
                tone={meta.tone}
              />
            </button>
          );
        })}
      </div>

      {data.flaggedWorkers.length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/40 shadow-sm">
          <CardHeader className="pb-vera-3">
            <CardTitle className="flex items-center gap-vera-2 text-base">
              <ShieldAlert className="h-5 w-5 text-amber-700" aria-hidden />
              Flagged workers ({data.flaggedWorkers.length})
            </CardTitle>
            <CardDescription>
              Non-compliant, expiring, or invalid training detected on the roster.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-vera-2">
            {data.flaggedWorkers.map((w) => (
              <Link
                key={w.workerId}
                href={`/verify/${w.workerId}`}
                className="inline-flex items-center gap-vera-2 rounded-lg border border-amber-200/80 bg-white px-vera-3 py-vera-2 text-sm shadow-sm hover:border-vera-teal/40"
              >
                <span className="font-medium text-vera-charcoal">
                  {w.firstName} {w.lastName}
                </span>
                {w.flags.map((f) => (
                  <StatusPill
                    key={f}
                    tone={
                      f === "INVALID_TRAINING"
                        ? "danger"
                        : f === "EXPIRING_TRAINING"
                          ? "warning"
                          : "danger"
                    }
                    subtle
                  >
                    {f.replace(/_/g, " ")}
                  </StatusPill>
                ))}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {data.projects.length > 0 && (
        <Card className="border-vera-charcoal/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Project compliance</CardTitle>
            <CardDescription>
              Training roll-up per active project (updated on upload).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Verified</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                  <TableHead className="text-right">Expiring</TableHead>
                  <TableHead className="text-right">Flagged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.projects.map((p) => (
                  <TableRow key={p.projectId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/companies/${companyId}/projects/${p.projectId}`}
                        className="hover:text-vera-teal hover:underline"
                      >
                        {p.projectName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.counts.verified}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.counts.pending}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-600">
                      {p.counts.rejected}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-amber-700">
                      {p.counts.expiring}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.flaggedWorkerCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">{BUCKET_META[filter].label}</CardTitle>
          <CardDescription>
            {rows.length} record{rows.length === 1 ? "" : "s"} in this bucket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={ShieldOff}
              title="No records in this bucket"
              description="Upload training via a provider or ingestion to populate compliance."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TrainingRow key={r.trainingRecordId} row={r} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function TrainingRow({ row }: { row: TrainingComplianceRow }) {
  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/verify/${row.workerId}`}
          className="font-medium text-vera-charcoal hover:text-vera-teal hover:underline"
        >
          {row.workerName}
        </Link>
      </TableCell>
      <TableCell>{row.courseName}</TableCell>
      <TableCell className="text-sm text-vera-muted">
        {row.providerName ?? "—"}
      </TableCell>
      <TableCell className="text-sm text-vera-muted">
        {row.projectName ?? "—"}
      </TableCell>
      <TableCell className="text-right tabular-nums text-vera-muted">
        {formatShortDate(parseDate(row.expiresAt))}
      </TableCell>
      <TableCell>
        <StatusPill tone={outcomeTone(row.validationOutcome)} subtle>
          {row.validationOutcome?.replace(/_/g, " ") ?? "Unverified"}
        </StatusPill>
      </TableCell>
      <TableCell className="text-right">
        <Link
          href={`/verify/training?id=${encodeURIComponent(String(row.trainingRecordId))}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Open
        </Link>
      </TableCell>
    </TableRow>
  );
}
