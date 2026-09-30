"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchProjectSafetyContext,
  fetchStationHealth,
  type ProjectSafetyContext,
} from "@/lib/safety-management";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Props = {
  projectId: number;
  siteId?: number;
};

export default function SupervisorSafetyDashboard({ projectId, siteId }: Props) {
  const [ctx, setCtx] = useState<ProjectSafetyContext | null>(null);
  const [stations, setStations] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchProjectSafetyContext(projectId)
      .then(setCtx)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load context"),
      );
    if (siteId) {
      void fetchStationHealth(siteId)
        .then(setStations)
        .catch(() => undefined);
    }
  }, [projectId, siteId]);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">{error}</div>
    );
  }

  if (!ctx) {
    return <div className="p-6 text-sm text-[var(--sf-text-muted)]">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--sf-text)]">
          Supervisor safety dashboard
        </h1>
        <p className="text-sm text-[var(--sf-text-muted)]">
          {ctx.companyName}
          {ctx.siteName ? ` · ${ctx.siteName}` : ""} · Project #{ctx.projectId}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Open CAIL</p>
          <p className="text-2xl font-semibold">{ctx.openCailCount}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{ctx.overdueCailCount}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">SIF open</p>
          <p className="text-2xl font-semibold">{ctx.sifOpenCount}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Risk score</p>
          <p className="text-2xl font-semibold">
            {ctx.riskSnapshot?.score ?? "—"}
          </p>
        </SfCard>
      </div>

      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/pm/safety-forms/fill/daily-flha">
            <SfButton type="button">New FLHA</SfButton>
          </Link>
          <Link href="/pm/safety-intelligence/inspections/new">
            <SfButton variant="secondary" type="button">
              Walk-around
            </SfButton>
          </Link>
          <Link href={`/pm/safety/site-access?projectId=${projectId}`}>
            <SfButton variant="secondary" type="button">
              Site access
            </SfButton>
          </Link>
          {siteId ? (
            <Link href={`/pm/safety/emergency?siteId=${siteId}&projectId=${projectId}`}>
              <SfButton variant="secondary" type="button">
                Emergency / muster
              </SfButton>
            </Link>
          ) : null}
        </div>
      </SfCard>

      {stations.length > 0 ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">Safety stations</h2>
          <ul className="space-y-2 text-sm">
            {stations.map((s) => (
              <li key={String(s.id)} className="flex justify-between">
                <span>{String(s.name)}</span>
                <span
                  className={
                    s.healthy ? "text-green-600" : "text-amber-600"
                  }
                >
                  {s.healthy ? "Online" : "Stale"}
                </span>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}
    </div>
  );
}
