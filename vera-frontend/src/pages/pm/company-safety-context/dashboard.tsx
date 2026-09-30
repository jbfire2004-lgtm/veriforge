"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  autoGenerateCompanyProfile,
  fetchCompanyCailInsights,
  fetchCompanySafetyAnalytics,
  fetchCompanySafetyContext,
  listCompanyControls,
  listCompanyHazards,
  listCompanyTrainingMatrix,
  publishCompanyProfile,
  syncCompanyToProjects,
} from "@/lib/pm-company-safety-context";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Tab = "profile" | "hazards" | "controls" | "training" | "insights";

export default function PmCompanySafetyContextDashboard({
  companyId = 1,
}: {
  companyId?: number;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const [context, setContext] = useState<Record<string, unknown> | null>(null);
  const [hazards, setHazards] = useState<Array<Record<string, unknown>>>([]);
  const [controls, setControls] = useState<Array<Record<string, unknown>>>([]);
  const [training, setTraining] = useState<Array<Record<string, unknown>>>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);

  const reload = useCallback(() => {
    void fetchCompanySafetyContext(companyId).then(setContext).catch(() => undefined);
    void listCompanyHazards(companyId).then(setHazards).catch(() => undefined);
    void listCompanyControls(companyId).then(setControls).catch(() => undefined);
    void listCompanyTrainingMatrix(companyId).then(setTraining).catch(() => undefined);
    void fetchCompanySafetyAnalytics(companyId).then(setAnalytics).catch(() => undefined);
    void fetchCompanyCailInsights(companyId).then(setInsights).catch(() => undefined);
  }, [companyId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const profile = context?.profile as Record<string, unknown> | null | undefined;
  const counts = context?.counts as Record<string, number> | undefined;

  return (
    <VeraPageLayout
      title="Company safety context"
      description={`Corporate profile, master hazard/control libraries, training matrix, policies, SDS, emergency plans — company #${companyId}`}
    >
      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Safety score</p>
            <p className="text-2xl font-semibold">{String(analytics.safetyScore)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Denial rate (30d)</p>
            <p className="text-2xl font-semibold">{String(analytics.denialRate30d)}%</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Published hazards</p>
            <p className="text-2xl font-semibold">{String(analytics.publishedHazards)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Risk forecast</p>
            <p className="text-2xl font-semibold capitalize">
              {String(
                (analytics.corporateRiskForecast as { predictedLevel?: string })
                  ?.predictedLevel ?? "—",
              )}
            </p>
          </SfCard>
        </div>
      ) : null}

      {counts ? (
        <p className="text-sm text-[var(--sf-text-muted)]">
          {counts.activeProjects} active projects · {counts.hazards} hazards · {counts.controls}{" "}
          controls · {counts.trainingRules} training rules
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(
          [
            ["profile", "Corporate profile"],
            ["hazards", "Hazard library"],
            ["controls", "Control library"],
            ["training", "Training matrix"],
            ["insights", "CAIL"],
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

      {tab === "profile" ? (
        <SfCard className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <SfButton onClick={() => void autoGenerateCompanyProfile(companyId).then(reload)}>
              Auto-generate profile
            </SfButton>
            <SfButton
              variant="secondary"
              onClick={() => void publishCompanyProfile(companyId).then(reload)}
            >
              Publish profile
            </SfButton>
            <SfButton
              variant="secondary"
              onClick={() => void syncCompanyToProjects(companyId).then(reload)}
            >
              Sync to projects
            </SfButton>
          </div>
          {profile ? (
            <p className="text-sm">
              Risk: <strong>{String(profile.corporateRiskLevel)}</strong> · Status:{" "}
              {String(profile.status)}
            </p>
          ) : null}
        </SfCard>
      ) : null}

      {tab === "hazards" ? (
        <SfCard className="p-4">
          <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
            {hazards.map((h) => (
              <li key={String(h.id)} className="border-b py-1">
                {String(h.title)} ({String(h.category)}) — {String(h.status)}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "controls" ? (
        <SfCard className="p-4">
          <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
            {controls.map((c) => (
              <li key={String(c.id)} className="border-b py-1">
                {String(c.title)} ({String(c.controlType)}) — {String(c.status)}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "training" ? (
        <SfCard className="p-4">
          <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
            {training.map((t) => (
              <li key={String(t.id)} className="border-b py-1">
                {String(t.roleType)}: {String(t.trainingCode)} — {String(t.trainingName)}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "insights" ? (
        <SfCard className="p-4">
          <ul className="space-y-3 text-sm">
            {insights.map((i) => (
              <li key={String(i.title)} className="border-b pb-2">
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
