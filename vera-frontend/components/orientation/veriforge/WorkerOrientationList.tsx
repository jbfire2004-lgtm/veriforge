"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerOrientationProfile } from "@/lib/orientation/veriforge-queries";
import type { OrientationMustCompleteBefore } from "@/lib/orientation/veriforge-types";
import {
  CompletionStatusBadge,
  GatingBanner,
} from "./OrientationStatusBadges";

type Props = {
  workerId: number;
  companyId?: number;
  projectId?: number;
  companyLabel?: string | null;
  projectLabel?: string | null;
  basePath: string;
};

type ItemStatus = "pending" | "in_progress" | "expired" | "completed";

function progressKey(workerId: number, orientationId: string) {
  return `vf-orient-progress:${workerId}:${orientationId}`;
}

function readInProgress(workerId: number, orientationId: string) {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(progressKey(workerId, orientationId)));
  } catch {
    return false;
  }
}

function dueLabel(before: OrientationMustCompleteBefore) {
  if (before === "arrival") return "Before arrival";
  if (before === "dispatch") return "Before dispatch";
  return "Before assignment";
}

export function WorkerOrientationList({
  workerId,
  companyId,
  projectId,
  companyLabel,
  projectLabel,
  basePath,
}: Props) {
  const { data, isLoading, error } = useWorkerOrientationProfile(workerId, {
    companyId,
    projectId,
  });

  const contextLabel = useMemo(() => {
    const parts = [companyLabel, projectLabel].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  }, [companyLabel, projectLabel]);

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-[#B33A3A]" role="alert">
        {error instanceof Error ? error.message : "Failed to load profile"}
      </p>
    );
  }

  if (!data) return null;

  const completedByOrientation = new Map(
    data.completedOrientations.map((c) => [c.orientationId, c]),
  );

  const requiredBeforeArrival = data.requiredOrientations.filter((r) => {
    const done = completedByOrientation.get(r.orientationId);
    return !done || done.status === "expired";
  });

  function itemStatus(orientationId: string): ItemStatus {
    const done = completedByOrientation.get(orientationId);
    if (done?.status === "expired") return "expired";
    if (done?.status === "completed") return "completed";
    if (readInProgress(workerId, orientationId)) return "in_progress";
    return "pending";
  }

  function playerHref(orientationId: string) {
    const q = new URLSearchParams();
    if (companyId) q.set("companyId", String(companyId));
    if (projectId) q.set("projectId", String(projectId));
    const qs = q.toString();
    return `${basePath}/${orientationId}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-1 sm:px-0">
      <GatingBanner
        gatingStatus={data.gatingStatus}
        missingCount={data.missingOrientations.length}
        missingTitles={data.missingOrientations.map((m) => m.title)}
        projectLabel={projectLabel ?? (projectId ? `Project #${projectId}` : null)}
      />

      <section className="space-y-3" aria-labelledby="required-heading">
        <h2
          id="required-heading"
          className="text-sm font-semibold uppercase tracking-wide text-[#2A2E33]/60"
        >
          Required before arrival
        </h2>
        {!requiredBeforeArrival.length ? (
          <p className="text-sm text-[#2A2E33]/65">
            You’re clear — no outstanding required orientations.
          </p>
        ) : (
          <ul className="space-y-3">
            {requiredBeforeArrival.map((r) => {
              const status = itemStatus(r.orientationId);
              const cta = status === "in_progress" ? "Resume" : "Start";
              return (
                <li key={r.requirementId}>
                  <Card>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <p className="font-medium text-[#1F2328]">{r.title}</p>
                        <p className="text-xs text-[#2A2E33]/65">
                          {contextLabel ?? r.type}
                        </p>
                        <p className="text-xs text-[#2A2E33]/65">
                          Due: {dueLabel(r.mustCompleteBefore)}
                          <span className="sr-only">
                            ({r.mustCompleteBefore})
                          </span>
                        </p>
                        <CompletionStatusBadge status={status} />
                      </div>
                      <Link href={playerHref(r.orientationId)} className="shrink-0">
                        <Button size="sm" className="w-full gap-2 sm:w-auto">
                          <Play className="h-4 w-4" aria-hidden />
                          {cta}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="completed-heading">
        <h2
          id="completed-heading"
          className="text-sm font-semibold uppercase tracking-wide text-[#2A2E33]/60"
        >
          Completed
        </h2>
        {!data.completedOrientations.length ? (
          <p className="text-sm text-[#2A2E33]/65">No completions yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.completedOrientations.map((c) => (
              <li key={c.completionId}>
                <Card>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <p className="font-medium text-[#1F2328]">
                        {c.title ?? c.orientationId}
                      </p>
                      {contextLabel ? (
                        <p className="text-xs text-[#2A2E33]/65">
                          {contextLabel}
                        </p>
                      ) : null}
                      <CompletionStatusBadge status={c.status} />
                      <p className="text-xs text-[#2A2E33]/65">
                        Completed{" "}
                        {c.completedOn
                          ? new Date(c.completedOn).toLocaleDateString()
                          : "—"}
                        {c.expiresOn
                          ? ` · expires ${new Date(c.expiresOn).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <Link
                      href={playerHref(c.orientationId)}
                      className="shrink-0"
                    >
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        View details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
