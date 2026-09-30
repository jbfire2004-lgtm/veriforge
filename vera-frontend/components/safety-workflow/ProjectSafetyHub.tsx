"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useOptionalFieldMode } from "@/components/field/FieldModeProvider";
import { listCachedProjectSafetyForms } from "@/lib/field/offline-bundle";
import {
  fetchProjectSafetyForms,
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
import { SafetyFormTypeLauncher } from "./SafetyFormTypeLauncher";

type Props = {
  projectId: number;
  companyId?: number;
};

export function ProjectSafetyHub({ projectId, companyId }: Props) {
  const field = useOptionalFieldMode();
  const offline = Boolean(field?.fieldModeActive && !field.isOnline && field.cache);
  const [forms, setForms] = useState<SafetyWorkflowForm[]>([]);
  const [filter, setFilter] = useState<SafetyFormType | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (!field?.cache || !field.isOnline || companyId == null) return;
    void field.preload(companyId, projectId);
  }, [field, companyId, projectId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (offline && field?.cache) {
        const cached = await listCachedProjectSafetyForms(field.cache, projectId);
        const mapped = cached.map((row) => {
          const r = row as {
            id: string;
            formType?: SafetyFormType | null;
            definitionId?: string;
            title?: string | null;
            status?: string;
            updatedAt?: string;
            worker?: { firstName: string; lastName: string };
          };
          return {
            id: r.id,
            formType: r.formType ?? undefined,
            definitionId: r.definitionId ?? "",
            title: r.title ?? undefined,
            status: (r.status ?? "DRAFT") as SafetyWorkflowForm["status"],
            updatedAt: r.updatedAt ?? new Date().toISOString(),
            worker: r.worker,
          } satisfies SafetyWorkflowForm;
        });
        const filtered =
          filter === "ALL" ? mapped : mapped.filter((f) => f.formType === filter);
        setForms(filtered);
        setFromCache(true);
        setError(null);
        return;
      }

      const rows = await fetchProjectSafetyForms(projectId, {
        formType: filter === "ALL" ? undefined : filter,
      });
      setForms(rows);
      setFromCache(false);
      setError(null);
    } catch (e) {
      if (field?.cache) {
        const cached = await listCachedProjectSafetyForms(field.cache, projectId);
        if (cached.length > 0) {
          setForms(
            cached.map((row) => {
              const r = row as {
                id: string;
                formType?: SafetyFormType | null;
                definitionId?: string;
                title?: string | null;
                status?: string;
                updatedAt?: string;
              };
              return {
                id: r.id,
                formType: r.formType ?? undefined,
                definitionId: r.definitionId ?? "",
                title: r.title ?? undefined,
                status: (r.status ?? "DRAFT") as SafetyWorkflowForm["status"],
                updatedAt: r.updatedAt ?? new Date().toISOString(),
              };
            }),
          );
          setFromCache(true);
          setError(null);
          return;
        }
      }
      setError(e instanceof Error ? e.message : "Could not load safety forms.");
    } finally {
      setLoading(false);
    }
  }, [projectId, filter, offline, field?.cache]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <ErrorState title="Safety forms unavailable" description={error} />;
  }

  return (
    <div className="space-y-vera-6">
      <header className="space-y-vera-1">
        <h1 className="text-2xl font-medium tracking-tight text-vera-deep">Project safety</h1>
        <p className="text-sm text-vera-muted">
          JHA, FLHA, SIF, HECA, Energy Wheel, and inspections for project {projectId}.
          {fromCache ? " Showing cached forms — reconnect to refresh." : null}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Start a new form</CardTitle>
          <CardDescription>Mobile-friendly workflows with supervisor review.</CardDescription>
        </CardHeader>
        <CardContent>
          <SafetyFormTypeLauncher projectId={projectId} companyId={companyId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Forms on this project</CardTitle>
            <CardDescription>{forms.length} record(s)</CardDescription>
          </div>
          <div className="space-y-1">
            <label htmlFor="project-safety-type-filter" className="sr-only">
              Filter safety forms by type
            </label>
            <select
              id="project-safety-type-filter"
              className="min-h-11 rounded-lg border border-vera-border px-3 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as SafetyFormType | "ALL")}
            >
              <option value="ALL">All types</option>
              {(Object.keys(SAFETY_FORM_TYPE_LABELS) as SafetyFormType[]).map((t) => (
                <option key={t} value={t}>
                  {SAFETY_FORM_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : forms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-vera-border bg-vera-surface/30 p-6 text-center">
              <ClipboardList className="mx-auto mb-2 h-5 w-5 text-vera-muted" aria-hidden />
              <p className="text-sm font-medium text-vera-deep">No safety forms yet.</p>
              <p className="mt-1 text-xs text-vera-muted">
                Start a new form above to begin project safety tracking.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.formType ?? f.definitionId}</TableCell>
                    <TableCell>
                      <Link
                        href={`/pm/safety-forms/${f.id}`}
                        className="font-medium hover:text-vera-teal hover:underline"
                      >
                        {f.title ?? "Untitled"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {f.worker
                        ? `${f.worker.firstName} ${f.worker.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusPill tone="neutral" subtle>
                        {f.status}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-sm text-vera-muted">
                      {new Date(f.updatedAt).toLocaleDateString()}
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
