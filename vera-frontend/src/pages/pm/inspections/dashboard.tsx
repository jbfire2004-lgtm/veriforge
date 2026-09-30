"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  fetchPmInspectionAnalytics,
  fetchPmInspectionIntelligence,
  getPmTemplateKind,
  listPmInspections,
  type PmInspection,
  type PmInspectionTemplate,
} from "@/lib/pm-inspections";
import { usePmInspectionCatalog } from "@/hooks/usePmInspectionCatalog";
import {
  ArrowRight,
  Camera,
  ClipboardCheck,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import {
  WorkspaceMetricCard,
} from "@/components/theme/workspace";
import { PmPageShell } from "@/src/components/pm/layout";

type LaunchCardProps = {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: ReactNode;
  accent: string;
  featured?: boolean;
  secondaryHref?: string;
  secondaryLabel?: string;
};

function LaunchCard({
  href,
  title,
  description,
  cta,
  icon,
  accent,
  featured,
  secondaryHref,
  secondaryLabel,
}: LaunchCardProps) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-[#2A2E33]/5 transition hover:-translate-y-0.5 hover:shadow-md ${
        featured ? "border-[#2F8F8C]/30 md:col-span-2 lg:col-span-1" : "border-[#2A2E33]/10"
      }`}
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[#2A2E33]">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5a6b7c]">
        {description}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#247A78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F8F8C]"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="text-center text-sm font-medium text-[#247A78] hover:underline"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function PmInspectionsDashboardPage({
  projectId = 1,
  companyId = 1,
  initialTemplates = [],
  libraryError = null,
}: {
  projectId?: number;
  companyId?: number;
  initialTemplates?: PmInspectionTemplate[];
  libraryError?: string | null;
}) {
  const {
    companyId: scopedCompanyId,
    projectId: scopedProjectId,
    query,
    session,
    authLoading,
    authenticated,
    tokenReady,
  } = usePmInspectionScope(companyId, projectId);
  const {
    templates,
    counts,
    error: catalogError,
    ready: catalogReady,
    authLoading: catalogAuthLoading,
    authenticated: catalogAuth,
    tokenReady: catalogTokenReady,
    sessionExpired,
  } = usePmInspectionCatalog(companyId, projectId, initialTemplates, libraryError);
  const [inspections, setInspections] = useState<PmInspection[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [intel, setIntel] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (authLoading || !tokenReady) return;

    const ctx = { session };

    void listPmInspections(scopedProjectId, scopedCompanyId, ctx)
      .then((rows) => setInspections(Array.isArray(rows) ? rows : []))
      .catch(() => undefined);
    void fetchPmInspectionAnalytics(scopedProjectId, ctx)
      .then(setAnalytics)
      .catch(() => undefined);
    void fetchPmInspectionIntelligence(scopedProjectId, ctx)
      .then(setIntel)
      .catch(() => undefined);
  }, [
    scopedProjectId,
    scopedCompanyId,
    authLoading,
    tokenReady,
    session,
  ]);

  const kindLabel = (kind: string) => {
    if (kind === "smart_site") return "Smart site";
    if (kind === "focus_audit") return "Focus audit";
    return "Checklist";
  };

  return (
    <PmPageShell
      title="Inspections & checklists"
      description="Smart site walkdowns with AI photo analysis, industry focus audits, and a full checklist library — assign findings to contractors and track CAPA."
      actions={
        <Link
          href={`/pm/inspections/smart-site${query}`}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90"
        >
          <Camera className="h-4 w-4" />
          Start smart site inspection
        </Link>
      }
      auth={{
        authLoading: authLoading || catalogAuthLoading,
        authenticated: authenticated && catalogAuth,
        tokenReady: tokenReady && catalogTokenReady,
        sessionExpired,
        signInMessage: "Sign in to load inspections.",
      }}
    >
        {catalogError ? (
          <p className="text-sm text-amber-700" role="status">
            {catalogError}
          </p>
        ) : null}

        {catalogReady && counts ? (
          <p className="text-sm text-[#5a6b7c]">
            Library: {counts.checklist} checklists · {counts.focus_audit} focus audits ·{" "}
            {counts.smart_site} smart site
            {templates.length > 0 ? ` (${templates.length} templates total)` : ""}.
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LaunchCard
            featured
            href={`/pm/inspections/smart-site${query}`}
            title="Smart Site Inspection"
            description="Walk the site with your camera. Each photo is numbered on the report and at-risk findings can be assigned to the responsible company."
            cta="Open smart site"
            icon={<Camera className="h-6 w-6 text-[#247A78]" />}
            accent="bg-gradient-to-br from-teal-50 to-emerald-100"
          />
          <LaunchCard
            href={`/pm/inspections/focus-audits${query}`}
            title="Focus Audits"
            description="Targeted, photo-assisted audits for fall protection, lockout, ground control, machine guarding, and 30+ other high-risk programs."
            cta="Browse focus audits"
            icon={<Target className="h-6 w-6 text-amber-700" />}
            accent="bg-gradient-to-br from-amber-50 to-orange-100"
          />
          <LaunchCard
            href={`/pm/inspections/new${query}`}
            title="Checklists & templates"
            description="PME, crane, scaffolding, excavation, hot work, environmental, emergency prep, and your custom published checklists."
            cta="Start from template"
            secondaryHref={`/pm/inspections/templates${query}`}
            secondaryLabel="Manage templates"
            icon={<ListChecks className="h-6 w-6 text-slate-700" />}
            accent="bg-gradient-to-br from-slate-50 to-slate-200"
          />
        </section>

        {analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <WorkspaceMetricCard
              label="Total inspections"
              value={String(analytics.totalInspections)}
            />
            <WorkspaceMetricCard
              label="Pass rate"
              value={`${String(analytics.passRate)}%`}
              tone="teal"
            />
            <WorkspaceMetricCard
              label="Open deficiencies"
              value={String(analytics.openDeficiencies)}
              tone="amber"
            />
            <WorkspaceMetricCard
              label="Failed"
              value={String(analytics.failedInspections)}
              tone="red"
            />
          </div>
        ) : null}

        {intel ? (
          <div className="rounded-2xl border border-[#2F8F8C]/20 bg-gradient-to-r from-[#E4F3F2] to-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#247A78]">
              <Sparkles className="h-4 w-4" />
              CAIL inspection quality
            </p>
            <p className="mt-2 text-3xl font-bold text-[#2A2E33]">
              {String(intel.inspectionQualityScore)}
              <span className="text-lg font-medium text-[#5a6b7c]"> / 100</span>
            </p>
          </div>
        ) : null}

        <section className="space-y-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-[0.06em] text-[#2A2E33]">
                Recent inspections
              </h2>
              <p className="mt-1 text-sm text-[#5a6b7c]">
                Continue in progress or open completed reports.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={`/pm/inspections/shared${query}`}
                className="font-medium text-[#247A78] hover:underline"
              >
                Shared reports
              </Link>
              <Link
                href={`/pm/inspections/findings-log${query}`}
                className="font-medium text-[#247A78] hover:underline"
              >
                Findings log
              </Link>
            </div>
          </header>
          <ul className="divide-y divide-[#2A2E33]/10 rounded-xl border border-[#2A2E33]/10 bg-white">
            {inspections.map((i) => {
              const kind = getPmTemplateKind(i.template);
              const smartHref =
                kind === "smart_site" || kind === "focus_audit"
                  ? `/pm/inspections/${i.id}/smart-workspace${query}`
                  : `/pm/inspections/${i.id}${query}`;

              return (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <Link
                      href={smartHref}
                      className="font-medium text-[#2A2E33] hover:text-[#247A78]"
                    >
                      {i.title ?? i.template.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#5a6b7c]">
                      {kindLabel(kind)} · {i.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[#5a6b7c]">
                    {i.status !== "draft" && i.status !== "in_progress" ? (
                      <Link
                        href={`/pm/inspections/${i.id}/report${query}`}
                        className="font-medium text-[#247A78] hover:underline"
                      >
                        Report
                      </Link>
                    ) : null}
                    <span
                      className={
                        i.passed === false
                          ? "font-medium text-red-600"
                          : i.passed
                            ? "font-medium text-[#247A78]"
                            : ""
                      }
                    >
                      {i.passed === false ? "Failed" : i.passed ? "Pass" : "In progress"}
                    </span>
                  </div>
                </li>
              );
            })}
            {inspections.length === 0 ? (
              <li className="px-4 py-8 text-center text-[#5a6b7c]">
                <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-[#2A2E33]/25" />
                <p>No inspections yet.</p>
                <Link
                  href={`/pm/inspections/smart-site${query}`}
                  className="mt-2 inline-flex items-center gap-1 font-medium text-[#247A78] hover:underline"
                >
                  Start your first smart site inspection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
    </PmPageShell>
  );
}
