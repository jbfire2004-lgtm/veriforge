"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  autoGenerateProjectSafetyProfile,
  fetchProjectSafetyContext,
  fetchProjectSafetyCailInsights,
  importProjectControls,
  importProjectHazards,
  listProjectControls,
  listProjectHazards,
  publishProjectSafetyProfile,
} from "@/lib/pm-project-safety-context";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Tab = "profile" | "hazards" | "controls" | "insights";

export default function PmProjectSafetyContextDashboard({
  projectId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const [context, setContext] = useState<Record<string, unknown> | null>(null);
  const [hazards, setHazards] = useState<Array<Record<string, unknown>>>([]);
  const [controls, setControls] = useState<Array<Record<string, unknown>>>([]);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);

  const reload = useCallback(() => {
    void fetchProjectSafetyContext(projectId).then(setContext).catch(() => undefined);
    void listProjectHazards(projectId).then(setHazards).catch(() => undefined);
    void listProjectControls(projectId).then(setControls).catch(() => undefined);
    void fetchProjectSafetyCailInsights(projectId).then(setInsights).catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const profile = context?.profile as Record<string, unknown> | null | undefined;

  return (
    <VeraPageLayout
      title="Project safety context"
      description={`Safety profile, hazard & control libraries, enforcement, versioning — project #${projectId}`}
    >
      {profile ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Risk level</p>
            <p className="text-2xl font-semibold capitalize">{String(profile.riskLevel)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Profile status</p>
            <p className="text-2xl font-semibold">{String(profile.status)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Published hazards</p>
            <p className="text-2xl font-semibold">{String(context?.hazardLibraryCount ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Completeness</p>
            <p className="text-2xl font-semibold">{String(profile.completenessScore ?? 0)}%</p>
          </SfCard>
        </div>
      ) : (
        <SfCard className="p-4 text-sm text-[var(--sf-text-muted)]">
          No safety profile yet — auto-generate to configure project gates.
        </SfCard>
      )}

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(
          [
            ["profile", "Safety profile"],
            ["hazards", "Hazard library"],
            ["controls", "Control library"],
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

      {tab === "profile" ? (
        <SfCard className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <SfButton
              onClick={() =>
                void autoGenerateProjectSafetyProfile(projectId).then(reload)
              }
            >
              Auto-generate profile
            </SfButton>
            <SfButton
              variant="secondary"
              onClick={() =>
                void publishProjectSafetyProfile(projectId).then(reload)
              }
            >
              Publish profile
            </SfButton>
          </div>
          {profile ? (
            <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : null}
        </SfCard>
      ) : null}

      {tab === "hazards" ? (
        <SfCard className="space-y-3 p-4">
          <SfButton
            variant="secondary"
            onClick={() =>
              void importProjectHazards(projectId, [
                "company_library",
                "jha_flha",
                "inspection",
                "incident",
              ]).then(reload)
            }
          >
            Import hazards
          </SfButton>
          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
            {hazards.map((h) => (
              <li key={String(h.id)} className="border-b py-1">
                <span className="font-medium">{String(h.title)}</span> — {String(h.category)}{" "}
                <span className="text-[var(--sf-text-muted)]">({String(h.status)})</span>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "controls" ? (
        <SfCard className="space-y-3 p-4">
          <SfButton
            variant="secondary"
            onClick={() => void importProjectControls(projectId).then(reload)}
          >
            Import from company library
          </SfButton>
          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
            {controls.map((c) => (
              <li key={String(c.id)} className="border-b py-1">
                <span className="font-medium">{String(c.title)}</span> — {String(c.controlType)}{" "}
                <span className="text-[var(--sf-text-muted)]">({String(c.status)})</span>
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
            {insights.length === 0 ? (
              <li className="text-[var(--sf-text-muted)]">No CAIL insights</li>
            ) : null}
          </ul>
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}
