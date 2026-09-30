"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GraduationCap, UserMinus } from "lucide-react";
import {
  fetchWorkerProjectCompliance,
  removeWorkerFromProjectStub,
  requestTrainingForWorker,
  type WorkerProjectComplianceDetail,
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
import { ComplianceBadge } from "@/components/vera-core-ui/ComplianceBadge";

type Props = {
  companyId: number;
  projectId: number;
  workerId: number;
  backHref: string;
};

function gapTone(status: string) {
  if (status === "expired" || status === "missing") return "non_compliant" as const;
  if (status === "expiring_soon") return "at_risk" as const;
  return "ok" as const;
}

export function ProjectWorkerCompliancePanel({
  companyId,
  projectId,
  workerId,
  backHref,
}: Props) {
  const [detail, setDetail] = useState<WorkerProjectComplianceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkerProjectCompliance(projectId, workerId);
      setDetail(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load worker compliance.");
    }
  }, [projectId, workerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleRequestTraining() {
    const res = await requestTrainingForWorker(projectId, workerId);
    setActionMsg(res.message);
  }

  async function handleRemoveStub() {
    const res = await removeWorkerFromProjectStub(projectId, workerId);
    setActionMsg(res.message);
  }

  if (error) {
    return <ErrorState title="Worker compliance unavailable" description={error} />;
  }

  if (!detail) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-vera-6">
      <header className="flex flex-wrap items-end justify-between gap-vera-3">
        <div className="space-y-vera-1">
          <p className="text-sm text-vera-muted">
            {detail.projectName} · Worker compliance
          </p>
          <h1 className="text-2xl font-medium tracking-tight text-vera-deep">
            {detail.workerName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-vera-muted">
            {detail.role ? <span>Role: {detail.role}</span> : null}
            {detail.trade ? <span>Trade: {detail.trade}</span> : null}
            <ComplianceBadge
              state={detail.isCompliant ? "ok" : "non_compliant"}
            />
          </div>
        </div>
        <Link href={backHref} className={buttonStyles({ variant: "outline", size: "sm" })}>
          Back to project
        </Link>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonStyles({ variant: "teal", size: "sm" })}
          onClick={() => void handleRequestTraining()}
        >
          <GraduationCap className="h-4 w-4" aria-hidden />
          Request training
        </button>
        <button
          type="button"
          className={buttonStyles({ variant: "outline", size: "sm" })}
          onClick={() => void handleRemoveStub()}
        >
          <UserMinus className="h-4 w-4" aria-hidden />
          Remove from project
        </button>
        <Link
          href={`/verify/${workerId}`}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          Open worker profile
        </Link>
      </div>

      {actionMsg ? (
        <p className="rounded-lg border border-vera-border bg-vera-surface px-3 py-2 text-sm text-vera-muted">
          {actionMsg}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Required vs actual credentials</CardTitle>
          <CardDescription>
            Project rules applied to this worker on company {companyId}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-vera-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-vera-deep">Required</h3>
            {detail.required.length === 0 ? (
              <p className="text-sm text-vera-muted">No rules apply to this worker.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credential</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.required.map((r) => (
                    <TableRow key={r.ruleId}>
                      <TableCell>{r.certificationName}</TableCell>
                      <TableCell className="text-sm text-vera-muted">{r.ruleType}</TableCell>
                      <TableCell>
                        <ComplianceBadge state={gapTone(r.status)} />
                      </TableCell>
                      <TableCell className="text-sm text-vera-muted">
                        {r.expiresAt
                          ? new Date(r.expiresAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-vera-deep">On file</h3>
            {detail.actual.length === 0 ? (
              <p className="text-sm text-vera-muted">No matching training records.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credential</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.actual.map((r) => (
                    <TableRow key={r.credentialId}>
                      <TableCell>{r.certificationName}</TableCell>
                      <TableCell>
                        <StatusPill tone="neutral" subtle>
                          {r.lastVerificationStatus ?? "—"}
                        </StatusPill>
                      </TableCell>
                      <TableCell>
                        <ComplianceBadge state={gapTone(r.status)} />
                      </TableCell>
                      <TableCell className="text-sm text-vera-muted">
                        {r.expiresAt
                          ? new Date(r.expiresAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {detail.gaps.length > 0 ? (
            <div className="rounded-xl border border-vera-coral/30 bg-vera-coral/5 p-4">
              <h3 className="text-sm font-medium text-vera-deep">Blocking gaps</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-vera-muted">
                {detail.gaps.map((g) => (
                  <li key={g.ruleId}>{g.reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
