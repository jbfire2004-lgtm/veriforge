"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  declareEmergency,
  fetchActiveMuster,
  fetchEmergencyAnalytics,
  fetchEmergencyIntelligence,
  listEmergencyPlans,
  pmMusterAllClear,
  pmMusterCheckIn,
  startMuster,
} from "@/lib/pm-emergency-response";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";

type Tab = "muster" | "plans" | "declare" | "insights";

export default function PmEmergencyDashboardPage({
  siteId = 1,
  projectId = 1,
  companyId = 1,
}: {
  siteId?: number;
  projectId?: number;
  companyId?: number;
}) {
  const [tab, setTab] = useState<Tab>("muster");
  const [plans, setPlans] = useState<Array<Record<string, unknown>>>([]);
  const [muster, setMuster] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [workerId, setWorkerId] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  const reload = useCallback(() => {
    void listEmergencyPlans(companyId, siteId, projectId).then(setPlans).catch(() => undefined);
    void fetchActiveMuster(siteId).then(setMuster).catch(() => setMuster(null));
    void fetchEmergencyAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    void fetchEmergencyIntelligence(projectId).then(setInsights).catch(() => undefined);
  }, [siteId, projectId, companyId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <VeraPageLayout
      title="Emergency response"
      description={`Plans, muster, evacuation, notifications, and CAIL — site #${siteId}, project #${projectId}`}
    >
      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Muster compliance</p>
            <p className="text-2xl font-semibold">
              {String(analytics.avgMusterCompliance)}%
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Equipment readiness</p>
            <p className="text-2xl font-semibold">
              {String(analytics.equipmentReadinessAvg)}%
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Project score</p>
            <p className="text-2xl font-semibold">
              {String(analytics.projectEmergencyScore)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Open events</p>
            <p className="text-2xl font-semibold text-red-600">
              {String(analytics.openEmergencyEvents)}
            </p>
          </SfCard>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(
          [
            ["muster", "Muster"],
            ["plans", "Emergency plans"],
            ["declare", "Declare emergency"],
            ["insights", "CAIL insights"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-md bg-[var(--sf-primary)] px-3 py-1.5 text-sm text-white"
                : "rounded-md px-3 py-1.5 text-sm text-[var(--sf-text-muted)]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "muster" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">Muster tracking</h2>
          {muster ? (
            <>
              <p className="text-sm">
                Active · status <strong>{String(muster.status)}</strong>
                {Array.isArray(muster.missingWorkerIds) ? (
                  <span className="text-red-600">
                    {" "}
                    · missing: {(muster.missingWorkerIds as number[]).length}
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-2">
                <SfInput
                  placeholder="Worker ID"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                />
                <SfButton
                  type="button"
                  onClick={() => {
                    const wid = parseInt(workerId, 10);
                    if (!wid || !muster.id) return;
                    void pmMusterCheckIn(String(muster.id), { workerId: wid }).then(reload);
                  }}
                >
                  Check in
                </SfButton>
                <SfButton
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    void pmMusterAllClear(String(muster.id)).then(reload)
                  }
                >
                  All clear
                </SfButton>
              </div>
            </>
          ) : (
            <SfButton
              type="button"
              onClick={() =>
                void startMuster({ companyId, siteId, projectId }).then(reload)
              }
            >
              Start muster
            </SfButton>
          )}
        </SfCard>
      ) : null}

      {tab === "plans" ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">Emergency plans ({plans.length})</h2>
          <ul className="divide-y text-sm">
            {plans.map((p) => (
              <li key={String(p.id)} className="py-2">
                <span className="font-medium">{String(p.title)}</span>
                <span className="text-[var(--sf-text-muted)]">
                  {" "}
                  · {String(p.planType)} · {String(p.status)}
                </span>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "declare" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">Declare emergency</h2>
          <SfInput
            placeholder="Event title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <SfButton
            type="button"
            onClick={() => {
              if (!eventTitle.trim()) return;
              void declareEmergency({
                companyId,
                siteId,
                projectId,
                eventType: "evacuation",
                title: eventTitle.trim(),
              }).then(reload);
            }}
          >
            Declare + auto muster + lock site
          </SfButton>
        </SfCard>
      ) : null}

      {tab === "insights" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">CAIL emergency intelligence</h2>
          <ul className="space-y-2 text-sm">
            {insights.map((i, idx) => (
              <li key={idx} className="rounded border p-3">
                <p className="font-medium">{String(i.title)}</p>
                <p className="text-[var(--sf-text-muted)]">{String(i.explanation)}</p>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}
