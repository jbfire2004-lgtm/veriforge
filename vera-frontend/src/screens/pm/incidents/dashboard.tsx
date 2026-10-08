"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPmIncidentAnalytics,
  listPmIncidents,
  type PmSafetyEvent,
} from "@/lib/pm-incidents";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export default function PmIncidentsDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [events, setEvents] = useState<PmSafetyEvent[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    void listPmIncidents(projectId).then(setEvents).catch(() => undefined);
    void fetchPmIncidentAnalytics(projectId)
      .then(setAnalytics)
      .catch(() => undefined);
  }, [projectId]);

  return (
    <VeraPageLayout
      title="Incidents, Near Miss & Observations"
      description={`Intake wizard, RCA, SIF/HECA, CAIL — project #${projectId}`}

      >

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Total events</p>
            <p className="text-2xl font-semibold">{String(analytics.totalEvents)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Near misses</p>
            <p className="text-2xl font-semibold">{String(analytics.nearMissTrend)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Injuries</p>
            <p className="text-2xl font-semibold text-red-600">
              {String(analytics.injuryCount)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Project score</p>
            <p className="text-2xl font-semibold">
              {String(analytics.projectIncidentScore)}
            </p>
          </SfCard>
        </div>
      ) : null}

      <SfCard className="p-5">
        <div className="mb-3 flex justify-between">
          <h2 className="font-medium">Recent events</h2>
          <Link href={`/pm/incidents/new?projectId=${projectId}&companyId=${companyId}`}>
            <SfButton type="button">Report event</SfButton>
          </Link>
        </div>
        <ul className="divide-y text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between py-2">
              <Link
                href={`/pm/incidents/${e.id}?projectId=${projectId}`}
                className="hover:text-[var(--sf-primary)]"
              >
                {e.title}
              </Link>
              <span className="text-[var(--sf-text-muted)]">
                {e.eventType.replace(/_/g, " ")} · {e.severity} · {e.status}
              </span>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="py-4 text-[var(--sf-text-muted)]">No events yet.</li>
          ) : null}
        </ul>
      </SfCard>
    </VeraPageLayout>
  );
}
