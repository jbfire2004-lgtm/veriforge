"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchSafetyWorkflowForms,
  transitionSafetyWorkflowForm,
  SAFETY_FORM_TYPE_LABELS,
  type SafetyFormType,
  type SafetyWorkflowForm,
} from "@/lib/safety-workflow";
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

type Props = {
  projectId?: number;
  companyId?: number;
};

export function SafetyFormReviewQueue({ projectId, companyId }: Props) {
  const [forms, setForms] = useState<SafetyWorkflowForm[]>([]);
  const [typeFilter, setTypeFilter] = useState<SafetyFormType | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await fetchSafetyWorkflowForms({
        projectId,
        companyId,
        formType: typeFilter === "ALL" ? undefined : typeFilter,
        awaitingReview: true,
      });
      setForms(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load review queue.");
    } finally {
      setLoading(false);
    }
  }, [projectId, companyId, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(formId: string, approve: boolean) {
    setBusyId(formId);
    try {
      await transitionSafetyWorkflowForm(
        formId,
        approve ? "APPROVED" : "REJECTED",
      );
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return <ErrorState title="Review queue unavailable" description={error} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Awaiting review</CardTitle>
          <CardDescription>Submitted safety forms requiring supervisor action.</CardDescription>
        </div>
        <select
          className="min-h-11 rounded-lg border border-vera-border px-3 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SafetyFormType | "ALL")}
        >
          <option value="ALL">All types</option>
          {(Object.keys(SAFETY_FORM_TYPE_LABELS) as SafetyFormType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : forms.length === 0 ? (
          <p className="text-sm text-vera-muted">No forms awaiting review.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.formType ?? f.definitionId}</TableCell>
                  <TableCell>
                    {f.worker ? `${f.worker.firstName} ${f.worker.lastName}` : "—"}
                  </TableCell>
                  <TableCell>{f.project?.name ?? f.projectId ?? "—"}</TableCell>
                  <TableCell>
                    <StatusPill tone="warn" subtle>
                      {f.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <Link
                      href={`/pm/safety-forms/${f.id}`}
                      className={buttonStyles({ variant: "outline", size: "sm" })}
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      className={buttonStyles({ variant: "teal", size: "sm" })}
                      disabled={busyId === f.id}
                      onClick={() => void review(f.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={buttonStyles({ variant: "destructive", size: "sm" })}
                      disabled={busyId === f.id}
                      onClick={() => void review(f.id, false)}
                    >
                      Reject
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
