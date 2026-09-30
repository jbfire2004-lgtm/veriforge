"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  GraduationCap,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import {
  acceptUnionHallTraining,
  getUnionHallTrainingDashboard,
  linkUnionHallProvider,
  pushUnionHallTraining,
  rejectUnionHallTraining,
  validateUnionHallTraining,
  type UnionHallTrainingDashboard,
  type UnionHallTrainingReceipt,
} from "@/lib/api/union-hall-training";
import {
  Badge,
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
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { formatShortDate, parseDate } from "@/components/wallet/worker-wallet-utils";

function qualTone(status: string | null): "success" | "warning" | "danger" | "neutral" {
  const s = (status ?? "").toUpperCase();
  if (s === "ACTIVE") return "success";
  if (s === "EXPIRED" || s === "SUSPENDED") return "danger";
  if (s === "PENDING") return "warning";
  return "neutral";
}

function complianceTone(status: string | null): "success" | "warning" | "danger" | "neutral" {
  const s = (status ?? "").toUpperCase();
  if (s === "COMPLIANT") return "success";
  if (s === "NEEDS_ATTENTION" || s === "PENDING_REVIEW") return "warning";
  if (s === "NON_COMPLIANT") return "danger";
  return "neutral";
}

export function UnionHallTrainingDashboard({ hallId }: { hallId: number }) {
  const [data, setData] = useState<UnionHallTrainingDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [providerIdInput, setProviderIdInput] = useState("");
  const [linkMessage, setLinkMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const dashboard = await getUnionHallTrainingDashboard(hallId);
      setData(dashboard);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load training dashboard.");
    }
  }, [hallId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(
    recordId: number,
    action: "accept" | "validate" | "push" | "reject"
  ) {
    setBusyId(recordId);
    try {
      if (action === "accept") await acceptUnionHallTraining(hallId, recordId);
      else if (action === "validate")
        await validateUnionHallTraining(hallId, recordId);
      else if (action === "push") await pushUnionHallTraining(hallId, recordId, {});
      else await rejectUnionHallTraining(hallId, recordId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (error != null && data == null) {
    return (
      <ErrorState title="Training dashboard unavailable" description={error} />
    );
  }

  if (data == null) {
    return (
      <Card>
        <CardContent className="p-vera-6">
          <Skeleton className="h-32 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-vera-6">
      <header className="space-y-vera-1">
        <h2 className="flex items-center gap-vera-2 text-xl font-medium text-vera-deep">
          <GraduationCap className="h-5 w-5 text-vera-teal" aria-hidden />
          Provider training
        </h2>
        <p className="text-sm text-vera-muted">
          Accept, validate, and push provider training to workers, companies, and projects.
        </p>
      </header>

      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Link training provider</CardTitle>
          <CardDescription>
            Accept training from a provider by linking their organization ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-vera-3">
          <label className="flex flex-col gap-vera-1 text-sm">
            <span className="text-vera-muted">Provider ID</span>
            <input
              type="number"
              min={1}
              value={providerIdInput}
              onChange={(e) => setProviderIdInput(e.target.value)}
              className="w-40 rounded-lg border border-vera-charcoal/20 px-vera-3 py-vera-2"
            />
          </label>
          <button
            type="button"
            className={buttonStyles({ variant: "teal", size: "sm" })}
            onClick={() => {
              const pid = Number(providerIdInput);
              if (!Number.isFinite(pid) || pid < 1) return;
              void linkUnionHallProvider(hallId, pid)
                .then(() => {
                  setLinkMessage("Provider linked.");
                  return load();
                })
                .catch((e: unknown) =>
                  setLinkMessage(
                    e instanceof Error ? e.message : "Could not link provider."
                  )
                );
            }}
          >
            Link provider
          </button>
          {linkMessage != null && (
            <p className="text-sm text-vera-muted">{linkMessage}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={data.counts.pending} icon={AlertTriangle} />
        <StatCard label="Accepted" value={data.counts.accepted} icon={CheckCircle2} />
        <StatCard label="Pushed" value={data.counts.pushed} icon={Send} />
        <StatCard label="Rejected" value={data.counts.rejected} icon={XCircle} />
      </div>

      <div className="grid gap-vera-6 lg:grid-cols-2">
        <Card className="border-vera-charcoal/10 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-vera-2 text-lg">
              <Building2 className="h-5 w-5" aria-hidden />
              Provider compliance
            </CardTitle>
            <CardDescription>Linked training providers and latest assessments.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.providers.length === 0 ? (
              <p className="text-sm text-vera-muted">No provider history yet.</p>
            ) : (
              <ul className="space-y-vera-3">
                {data.providers.filter(Boolean).map((p) =>
                  p ? (
                    <li
                      key={p.providerId}
                      className="flex flex-wrap items-center justify-between gap-vera-2 rounded-lg border border-vera-charcoal/10 px-vera-3 py-vera-2"
                    >
                      <span className="font-medium text-vera-charcoal">{p.name}</span>
                      <div className="flex flex-wrap gap-vera-2">
                        <StatusPill tone={complianceTone(p.complianceStatus)} subtle>
                          {p.complianceStatus ?? "Not assessed"}
                        </StatusPill>
                        {p.complianceScore != null && (
                          <Badge variant="outline">{p.complianceScore}%</Badge>
                        )}
                      </div>
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-vera-charcoal/10 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-vera-2 text-lg">
              <User className="h-5 w-5" aria-hidden />
              Instructor qualifications
            </CardTitle>
            <CardDescription>Status for instructors at linked providers.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.instructors.length === 0 ? (
              <p className="text-sm text-vera-muted">No instructors on file.</p>
            ) : (
              <ul className="max-h-64 space-y-vera-2 overflow-y-auto">
                {data.instructors.map((i) => (
                  <li
                    key={i.instructorId}
                    className="flex flex-wrap items-center justify-between gap-vera-2 text-sm"
                  >
                    <span>
                      {i.firstName} {i.lastName}
                      <span className="ml-vera-2 text-vera-muted">· {i.providerName}</span>
                    </span>
                    <StatusPill tone={qualTone(i.qualificationStatus)} subtle>
                      {i.qualificationStatus}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-vera-2 text-lg">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            Provider training history
          </CardTitle>
          <CardDescription>
            Incoming and processed training from providers for hall members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.providerTrainingHistory.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No provider training yet"
              description="When a provider issues training to a union member, it appears here for review."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.providerTrainingHistory.map((r) => (
                  <HistoryRow
                    key={r.receiptId}
                    row={r}
                    busy={busyId === r.trainingRecordId}
                    onAccept={() => void runAction(r.trainingRecordId, "accept")}
                    onValidate={() => void runAction(r.trainingRecordId, "validate")}
                    onPush={() => void runAction(r.trainingRecordId, "push")}
                    onReject={() => void runAction(r.trainingRecordId, "reject")}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardContent className="flex items-center gap-vera-4 p-vera-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-vera-muted">{label}</p>
          <p className="text-2xl font-medium tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryRow({
  row,
  busy,
  onAccept,
  onValidate,
  onPush,
  onReject,
}: {
  row: UnionHallTrainingReceipt;
  busy: boolean;
  onAccept: () => void;
  onValidate: () => void;
  onPush: () => void;
  onReject: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/verify/${row.workerId}`}
          className="font-medium hover:text-vera-teal hover:underline"
        >
          {row.workerName}
        </Link>
      </TableCell>
      <TableCell>
        <p>{row.courseName}</p>
        {row.instructorName != null && (
          <p className="text-xs text-vera-muted">Instructor {row.instructorName}</p>
        )}
      </TableCell>
      <TableCell className="text-sm">{row.providerName ?? "—"}</TableCell>
      <TableCell>
        <StatusPill tone={row.status === "PUSHED" ? "success" : "neutral"} subtle>
          {row.status}
        </StatusPill>
        {row.validationOutcome != null && (
          <p className="mt-vera-1 text-xs text-vera-muted">{row.validationOutcome}</p>
        )}
        <p className="text-xs text-vera-muted">
          Exp {formatShortDate(parseDate(row.expiresAt))}
        </p>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-wrap justify-end gap-vera-1">
          {row.status === "PENDING" && (
            <button
              type="button"
              disabled={busy}
              onClick={onAccept}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Accept
            </button>
          )}
          {(row.status === "PENDING" || row.status === "ACCEPTED") && (
            <button
              type="button"
              disabled={busy}
              onClick={onValidate}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Validate
            </button>
          )}
          {row.status !== "REJECTED" && row.status !== "PUSHED" && (
            <button
              type="button"
              disabled={busy}
              onClick={onPush}
              className={buttonStyles({ variant: "teal", size: "sm" })}
            >
              Push
            </button>
          )}
          {row.status === "PENDING" && (
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Reject
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
