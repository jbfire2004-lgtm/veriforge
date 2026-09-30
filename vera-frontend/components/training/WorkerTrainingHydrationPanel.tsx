"use client";

import type { Session } from "next-auth";
import { useWorkerTrainingHydration } from "@/hooks/useWorkerTrainingHydration";
import { TrainingStatusBadge } from "./TrainingStatusBadge";
import { SfCard } from "@/src/components/safety-forms/ui";

type Props = {
  workerId: number;
  projectId?: number;
  requiredTraining?: string[];
  session?: Session | null;
  tokenReady?: boolean;
  title?: string;
  showRequirementsOnly?: boolean;
};

export function WorkerTrainingHydrationPanel({
  workerId,
  projectId,
  requiredTraining,
  session,
  tokenReady = true,
  title = "Training from Vera Core",
  showRequirementsOnly = false,
}: Props) {
  const { data, loading, error } = useWorkerTrainingHydration({
    workerId,
    projectId,
    requiredTraining,
    session,
    tokenReady,
  });

  if (loading) {
    return (
      <SfCard className="p-4 text-sm text-[var(--sf-text-muted)]">
        Loading training from Core…
      </SfCard>
    );
  }

  if (error) {
    return (
      <SfCard className="p-4 text-sm text-red-600" role="alert">
        {error}
      </SfCard>
    );
  }

  if (!data) return null;

  const requirements = requiredTraining?.length
    ? data.requirements
    : data.requirements;

  return (
    <div className="space-y-4">
      <SfCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{title}</p>
          <p className="text-xs text-[var(--sf-text-muted)]">
            Hydrated {new Date(data.hydratedAt).toLocaleString()} · {data.summary.totalRecords}{" "}
            records
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <TrainingStatusBadge status="valid" />
          <span className="text-xs text-[var(--sf-text-muted)]">{data.summary.valid} met</span>
          <TrainingStatusBadge status="expired" />
          <span className="text-xs text-[var(--sf-text-muted)]">{data.summary.expired} expired</span>
          <TrainingStatusBadge status="missing" />
          <span className="text-xs text-[var(--sf-text-muted)]">{data.summary.missing} missing</span>
        </div>
      </SfCard>

      {requirements.length > 0 ? (
        <SfCard className="p-4">
          <p className="mb-3 text-sm font-medium">Training requirements</p>
          <ul className="space-y-2 text-sm">
            {requirements.map((req) => (
              <li
                key={req.code}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sf-border)] py-2 last:border-0"
              >
                <span>{req.name}</span>
                <TrainingStatusBadge status={req.status} />
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {!showRequirementsOnly && data.records.length > 0 ? (
        <SfCard className="p-4">
          <p className="mb-3 text-sm font-medium">Training records</p>
          <ul className="space-y-2 text-sm">
            {data.records.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sf-border)] py-2 last:border-0"
              >
                <div>
                  <p>{r.name}</p>
                  <p className="text-xs text-[var(--sf-text-muted)]">
                    {r.code}
                    {r.expiresAt
                      ? ` · expires ${new Date(r.expiresAt).toLocaleDateString()}`
                      : " · no expiry"}
                  </p>
                </div>
                <TrainingStatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {!showRequirementsOnly && data.competencies.length > 0 ? (
        <SfCard className="p-4">
          <p className="mb-3 text-sm font-medium">Competencies</p>
          <ul className="space-y-2 text-sm">
            {data.competencies.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sf-border)] py-2 last:border-0"
              >
                <span>
                  {c.equipmentName ?? c.equipmentTypeKey} · score {c.score}
                </span>
                <TrainingStatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {!showRequirementsOnly && data.restrictions.length > 0 ? (
        <SfCard className="p-4">
          <p className="mb-3 text-sm font-medium">Active restrictions</p>
          <ul className="space-y-2 text-sm">
            {data.restrictions
              .filter((r) => r.active)
              .map((r) => (
                <li key={r.id} className="rounded border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="font-medium">{r.type.replace(/_/g, " ")}</p>
                  <p className="text-[var(--sf-text-muted)]">{r.description}</p>
                </li>
              ))}
          </ul>
        </SfCard>
      ) : null}
    </div>
  );
}
