"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchSafetySuiteAlerts,
  fetchSafetySuiteDashboard,
  fetchSafetySuiteReadiness,
  type SafetySuiteAlert,
  type SafetySuiteReadiness,
} from "@/lib/safety-suite";
import { PM_SAFETY_WORKFLOW } from "@/lib/navigation/pm-workflow";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

const MODULES = [
  {
    href: "/pm/jha-flha",
    title: "JHA / FLHA",
    description: "Job hazard analysis and field-level hazard assessments with hazard builder, controls, and crew signoff.",
  },
  {
    href: "/pm/sif-heca",
    title: "SIF / HECA Engine",
    description: "Serious injury & fatality scoring, HECA classification, and explainable risk trace.",
  },
  {
    href: "/pm/sif-heca/evaluate",
    title: "SIF / HECA Evaluate",
    description: "Dry-run SIF detection and HECA classification before creating an event.",
  },
  {
    href: "/pm/safety-suite/libraries",
    title: "Hazard & control libraries",
    description: "Company and project hazard, control, SIF indicator, and HECA category libraries.",
  },
  {
    href: "/pm/safety-forms",
    title: "Safety form builder",
    description: "Permits, inspections, toolbox talks, and 25+ unified safety forms.",
  },
  {
    href: "/pm/unified-hazard-control",
    title: "Unified hazard & control",
    description: "Cross-module hazard registry, energy wheel mapping, and enforcement.",
  },
  {
    href: "/pm/safety-hub",
    title: "Safety dashboards",
    description: "Unified safety hub — inspections, CAPA, analytics, and notifications.",
  },
] as const;

function AlertList({ title, items }: { title: string; items: SafetySuiteAlert[] }) {
  if (items.length === 0) return null;
  return (
    <SfCard className="p-5">
      <h2 className="mb-3 font-medium">{title}</h2>
      <ul className="divide-y text-sm">
        {items.map((a) => (
          <li key={`${a.type}-${a.id}`} className="flex justify-between py-2">
            <Link href={a.href} className="hover:text-[var(--sf-primary)]">
              {a.title}
            </Link>
            <span className="text-[var(--sf-text-muted)]">{a.status ?? a.severity}</span>
          </li>
        ))}
      </ul>
    </SfCard>
  );
}

export default function SafetySuiteHubPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [readiness, setReadiness] = useState<SafetySuiteReadiness | null>(null);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [alerts, setAlerts] = useState<{
    jhaSifAlerts: SafetySuiteAlert[];
    sifReviewAlerts: SafetySuiteAlert[];
    incidentAlerts: SafetySuiteAlert[];
  } | null>(null);

  const qs = `projectId=${projectId}&companyId=${companyId}`;

  useEffect(() => {
    void fetchSafetySuiteReadiness(projectId).then(setReadiness).catch(() => undefined);
    void fetchSafetySuiteDashboard(projectId, companyId).then(setDashboard).catch(() => undefined);
    void fetchSafetySuiteAlerts(projectId, companyId).then(setAlerts).catch(() => undefined);
  }, [projectId, companyId]);

  const counts = (dashboard?.counts ?? {}) as Record<string, number>;
  const readinessColor =
    readiness?.level === "READY"
      ? "text-green-600"
      : readiness?.level === "AT_RISK"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <VeraPageLayout
      title="Vera Safety Suite"
      description={`JHA, FLHA, SIF, HECA, energy wheel, libraries, workflows, and readiness — project #${projectId}`}
    >
      {readiness ? (
        <SfCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">Safety readiness</p>
              <p className={`text-3xl font-semibold ${readinessColor}`}>
                {readiness.readinessScore}
              </p>
              <p className="text-sm text-[var(--sf-text-muted)]">{readiness.level.replace(/_/g, " ")}</p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--sf-text-muted)]">JHA quality</p>
                <p className="font-medium">{readiness.averageQualityScore}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--sf-text-muted)]">Project SIF index</p>
                <p className="font-medium">{readiness.projectSifScore}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--sf-text-muted)]">High SIF events</p>
                <p className="font-medium">{readiness.sifHighCount}</p>
              </div>
            </div>
          </div>
        </SfCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">FLHAs</p>
          <p className="text-2xl font-semibold">{counts.flha ?? "—"}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">JHAs</p>
          <p className="text-2xl font-semibold">{counts.jha ?? "—"}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">JHA pending review</p>
          <p className="text-2xl font-semibold">{counts.jhaPendingReview ?? "—"}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">SIF pending review</p>
          <p className="text-2xl font-semibold">{counts.sifPendingReview ?? "—"}</p>
        </SfCard>
      </div>

      {alerts ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AlertList title="JHA with SIF potential" items={alerts.jhaSifAlerts} />
          <AlertList title="SIF / HECA review queue" items={alerts.sifReviewAlerts} />
          <AlertList title="Open incidents" items={alerts.incidentAlerts} />
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-medium">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((m) => (
            <Link key={m.href} href={`${m.href}?${qs}`}>
              <SfCard className="h-full p-5 transition hover:border-[var(--sf-primary)]">
                <h3 className="font-medium">{m.title}</h3>
                <p className="mt-1 text-sm text-[var(--sf-text-muted)]">{m.description}</p>
              </SfCard>
            </Link>
          ))}
        </div>
      </section>

      <SfCard className="p-5">
        <h2 className="mb-3 font-medium">Safety workflow</h2>
        <ol className="space-y-3">
          {PM_SAFETY_WORKFLOW.map((step, i) => (
            <li key={step.id} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sf-surface-muted)] text-xs font-medium">
                {i + 1}
              </span>
              <div>
                {step.href ? (
                  <Link href={`${step.href}?${qs}`} className="font-medium hover:text-[var(--sf-primary)]">
                    {step.label}
                  </Link>
                ) : (
                  <span className="font-medium">{step.label}</span>
                )}
                <p className="text-[var(--sf-text-muted)]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </SfCard>

      <div className="flex flex-wrap gap-2">
        <Link href={`/pm/jha-flha/new/flha?${qs}`}>
          <SfButton type="button">New FLHA</SfButton>
        </Link>
        <Link href={`/pm/jha-flha/new/jha?${qs}`}>
          <SfButton variant="secondary" type="button">
            New JHA
          </SfButton>
        </Link>
        <Link href={`/pm/sif-heca/evaluate?${qs}`}>
          <SfButton variant="secondary" type="button">
            Evaluate SIF / HECA
          </SfButton>
        </Link>
      </div>
    </VeraPageLayout>
  );
}
