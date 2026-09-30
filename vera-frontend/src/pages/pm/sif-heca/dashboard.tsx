"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchSifEnergyWheel,
  fetchSifHecaAnalytics,
  listSifHecaEvents,
  type SifHecaEvent,
} from "@/lib/sif-heca";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export default function SifHecaDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [events, setEvents] = useState<SifHecaEvent[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(
    null,
  );
  const [energyWheel, setEnergyWheel] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    void listSifHecaEvents(projectId).then(setEvents).catch(() => undefined);
    void fetchSifHecaAnalytics(projectId)
      .then(setAnalytics)
      .catch(() => undefined);
    void fetchSifEnergyWheel()
      .then((res) => setEnergyWheel(res.segments ?? []))
      .catch(() => undefined);
  }, [projectId]);

  return (
    <VeraPageLayout
      title="SIF / HECA Engine"
      description={`Serious injury & fatality potential and high-energy control analysis — project #${projectId}`}
    >

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Events</p>
            <p className="text-2xl font-semibold">{String(analytics.totalEvents)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">High SIF</p>
            <p className="text-2xl font-semibold text-red-600">
              {String(analytics.sifHighCount)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Avg SIF score</p>
            <p className="text-2xl font-semibold">{String(analytics.averageSifScore)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Project SIF index</p>
            <p className="text-2xl font-semibold">{String(analytics.projectSifScore)}</p>
          </SfCard>
        </div>
      ) : null}

      {analytics?.hecaDistribution ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">HECA distribution</h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(analytics.hecaDistribution as Record<string, number>).map(
              ([code, count]) => (
                <li key={code} className="flex justify-between border-b py-1">
                  <span className="capitalize">{code.replace(/_/g, " ")}</span>
                  <span>{count}</span>
                </li>
              ),
            )}
          </ul>
        </SfCard>
      ) : null}

      {energyWheel.length > 0 ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">Energy wheel</h2>
          <div className="flex flex-wrap gap-2">
            {energyWheel.map((seg) => (
              <span
                key={String(seg.type)}
                className={`rounded-full px-3 py-1 text-xs ${
                  seg.highEnergy
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                    : "bg-[var(--sf-surface-muted)] text-[var(--sf-text-muted)]"
                }`}
              >
                {String(seg.label)}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--sf-text-muted)]">
            Highlighted segments contribute to high-energy SIF scoring.
          </p>
        </SfCard>
      ) : null}

      <SfCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Recent events</h2>
          <div className="flex gap-2">
            <Link href={`/pm/sif-heca/evaluate?projectId=${projectId}&companyId=${companyId}`}>
              <SfButton type="button">Evaluate risk</SfButton>
            </Link>
            <Link href={`/pm/jha-flha?projectId=${projectId}&companyId=${companyId}`}>
              <SfButton variant="secondary" type="button">
                JHA / FLHA
              </SfButton>
            </Link>
          </div>
        </div>
        <ul className="divide-y text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between py-2">
              <Link href={`/pm/sif-heca/${e.id}`} className="hover:text-[var(--sf-primary)]">
                {e.title}
              </Link>
              <span className="text-[var(--sf-text-muted)]">
                {e.sifScore?.sifCategory ?? "—"} · {e.status}
              </span>
            </li>
          ))}
        </ul>
      </SfCard>
    </VeraPageLayout>
  );
}
