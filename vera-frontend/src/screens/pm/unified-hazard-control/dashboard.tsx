"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  evaluateHcEnforcement,
  fetchHcCailInsights,
  fetchHcControls,
  fetchHcDashboard,
  fetchHcHazards,
  ingestHcBatch,
  syncHcCompanyToProject,
} from "@/lib/pm-unified-hazard-control";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Tab = "hazards" | "controls" | "energy" | "ingestion" | "insights";

export default function PmUnifiedHazardControlDashboard({
  companyId = 1,
  projectId,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const [tab, setTab] = useState<Tab>("hazards");
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [hazards, setHazards] = useState<Array<Record<string, unknown>>>([]);
  const [controls, setControls] = useState<Array<Record<string, unknown>>>([]);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [enforcement, setEnforcement] = useState<Record<string, unknown> | null>(null);

  const reload = useCallback(() => {
    void fetchHcDashboard(companyId, projectId).then(setDashboard).catch(() => undefined);
    void fetchHcHazards(companyId, projectId).then(setHazards).catch(() => undefined);
    void fetchHcControls(companyId, projectId).then(setControls).catch(() => undefined);
    void fetchHcCailInsights(companyId, projectId).then(setInsights).catch(() => undefined);
  }, [companyId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const metrics = dashboard?.metrics as Record<string, unknown> | undefined;
  const energyExposure = dashboard?.energyExposure as Array<Record<string, unknown>> | undefined;

  async function runIngest(source: string) {
    await ingestHcBatch(companyId, source, projectId);
    reload();
  }

  async function runSync() {
    if (!projectId) return;
    await syncHcCompanyToProject(companyId, projectId);
    reload();
  }

  async function runEnforcement() {
    const r = await evaluateHcEnforcement({ companyId, projectId });
    setEnforcement(r);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "hazards", label: "Hazard library" },
    { id: "controls", label: "Control library" },
    { id: "energy", label: "Energy wheel" },
    { id: "ingestion", label: "Ingestion" },
    { id: "insights", label: "CAIL" },
  ];

  return (
    <VeraPageLayout
      title="Unified hazard & control"
      description={`Company #${companyId}${projectId ? ` · Project #${projectId}` : ""}`}
    >
      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Hazards</p>
            <p className="text-2xl font-semibold">{String(metrics.hazardCount ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Controls</p>
            <p className="text-2xl font-semibold">{String(metrics.controlCount ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">SIF potential</p>
            <p className="text-2xl font-semibold">{String(metrics.sifCount ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Hazard score</p>
            <p className="text-2xl font-semibold">{String(metrics.companyHazardScore ?? "—")}</p>
          </SfCard>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === t.id
                ? "bg-[var(--sf-primary)] text-white"
                : "bg-[var(--sf-surface-muted)] text-[var(--sf-text-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
        {projectId ? (
          <SfButton variant="secondary" className="ml-auto" onClick={() => void runSync()}>
            Sync company → project
          </SfButton>
        ) : null}
        <SfButton variant="secondary" onClick={() => void runEnforcement()}>
          Evaluate enforcement
        </SfButton>
      </div>

      {enforcement ? (
        <SfCard className="p-4 text-sm">
          <p className="font-medium">
            Enforcement: {enforcement.allowed ? "Allowed" : "Blocked"}
          </p>
          {Array.isArray(enforcement.blockers) ? (
            <ul className="mt-2 list-disc pl-5 text-[var(--sf-text-muted)]">
              {(enforcement.blockers as string[]).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </SfCard>
      ) : null}

      {tab === "hazards" && (
        <SfCard className="p-4">
          <h2 className="mb-3 font-medium">Hazards ({hazards.length})</h2>
          <ul className="space-y-2 text-sm">
            {hazards.map((h) => (
              <li key={String(h.id)} className="flex justify-between border-b py-2">
                <span>
                  {String(h.title)}
                  {h.sifPotential ? " · SIF" : ""}
                </span>
                <span className="capitalize text-[var(--sf-text-muted)]">{String(h.status)}</span>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "controls" && (
        <SfCard className="p-4">
          <h2 className="mb-3 font-medium">Controls ({controls.length})</h2>
          <ul className="space-y-2 text-sm">
            {controls.map((c) => (
              <li key={String(c.id)} className="flex justify-between border-b py-2">
                <span>{String(c.title)}</span>
                <span className="capitalize">{String(c.controlType)} · {String(c.status)}</span>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "energy" && (
        <SfCard className="p-4">
          <h2 className="mb-3 font-medium">Energy exposure</h2>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            {(energyExposure ?? []).map((e) => (
              <li key={String(e.energyType)} className="rounded border p-2">
                <span className="font-medium capitalize">{String(e.energyType)}</span>
                <span className="ml-2 text-[var(--sf-text-muted)]">×{String(e.count)}</span>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "ingestion" && (
        <SfCard className="space-y-3 p-4">
          <h2 className="font-medium">Hazard ingestion</h2>
          <p className="text-sm text-[var(--sf-text-muted)]">
            Normalize hazards from JHA, inspections, company/project libraries, and PM tasks.
          </p>
          <div className="flex flex-wrap gap-2">
            <SfButton variant="secondary" onClick={() => void runIngest("company_library")}>
              Ingest company library
            </SfButton>
            {projectId ? (
              <>
                <SfButton variant="secondary" onClick={() => void runIngest("project_library")}>
                  Ingest project library
                </SfButton>
                <SfButton variant="secondary" onClick={() => void runIngest("jha_flha")}>
                  Ingest JHA hazards
                </SfButton>
                <SfButton variant="secondary" onClick={() => void runIngest("inspection")}>
                  Ingest inspection deficiencies
                </SfButton>
                <SfButton variant="secondary" onClick={() => void runIngest("pm_task")}>
                  Ingest PM blocked tasks
                </SfButton>
              </>
            ) : null}
          </div>
        </SfCard>
      )}

      {tab === "insights" && (
        <div className="space-y-3">
          {insights.map((i) => (
            <SfCard key={String(i.id)} className="p-4">
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">
                {String(i.category)} · {String(i.severity)}
              </p>
              <h3 className="font-medium">{String(i.title)}</h3>
              <p className="mt-1 text-sm">{String(i.explanation)}</p>
              <p className="mt-2 text-sm text-[var(--sf-primary)]">{String(i.recommendation)}</p>
            </SfCard>
          ))}
        </div>
      )}

      <SfCard className="p-4 text-sm">
        <p className="font-medium">Integrated modules</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/pm/company-safety-context?companyId=${companyId}`} className="text-[var(--sf-primary)] hover:underline">
            Company context
          </Link>
          {projectId ? (
            <Link href={`/pm/project-safety-context?projectId=${projectId}`} className="text-[var(--sf-primary)] hover:underline">
              Project context
            </Link>
          ) : null}
          <Link href="/pm/jha-flha" className="text-[var(--sf-primary)] hover:underline">
            JHA / FLHA
          </Link>
          <Link href="/pm/sif-heca" className="text-[var(--sf-primary)] hover:underline">
            SIF / HECA
          </Link>
        </div>
      </SfCard>
    </VeraPageLayout>
  );
}
