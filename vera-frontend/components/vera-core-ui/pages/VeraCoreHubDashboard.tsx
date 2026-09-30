"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileCheck, GraduationCap, Shield, Upload, Users } from "lucide-react";
import {
  CORE_MODULE_LINKS,
  CORE_WORKFLOW,
} from "@/lib/navigation/core-workflow";
import { buttonStyles } from "@/components/ui";
import { VeraPageLayout } from "@/src/components/navigation";
import { PmWorkflowJourney } from "@/src/components/pm/PmWorkflowJourney";
import type { PmWorkflowStep } from "@/lib/navigation/pm-workflow";
import { CoreHero } from "../CoreHero";
import { CoreDashboardGrid } from "../CoreDashboardGrid";
import { CoreMetricTile } from "../CoreMetricTile";
import { CoreSection } from "../CoreSection";
import { SyncPulse } from "../SyncPulse";
import { useVeraCoreUI } from "@/lib/vera-core-ui/store";
import { useCoreOfflineSync } from "@/lib/vera-core-ui/useCoreOfflineSync";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import {
  fetchCoreHubMetrics,
  type VeraCoreHubMetrics,
} from "@/lib/core/vera-core-platform";
import type { ComplianceState } from "../compliance";

const coreWorkflowSteps: PmWorkflowStep[] = CORE_WORKFLOW.map((s) => ({
  id: s.id,
  label: s.label,
  description: s.description,
  href: s.href,
}));

function iconForModule(href: string) {
  if (href.includes("workers")) return Users;
  if (href.includes("readiness")) return Shield;
  if (href.includes("safety-knowledge")) return GraduationCap;
  if (href.includes("verification") || href.includes("provider-hub")) return FileCheck;
  if (href.includes("training") || href.includes("ingest")) return GraduationCap;
  return Shield;
}

function readinessCompliance(state: string): ComplianceState {
  if (state === "ok") return "ok";
  if (state === "pending") return "pending";
  return "at_risk";
}

export function VeraCoreHubDashboard() {
  const { markSynced, setSyncStatus } = useVeraCoreUI();
  const { authLoading, tokenReady, authenticated, sessionExpired } = useVeraAuthOrHook();
  const [metrics, setMetrics] = useState<VeraCoreHubMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    if (authLoading || !authenticated || sessionExpired || !tokenReady) {
      return;
    }
    setSyncStatus("syncing");
    try {
      const data = await fetchCoreHubMetrics();
      setMetrics(data);
      markSynced(data.generatedAt);
    } catch {
      setSyncStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useCoreOfflineSync({ onReconnect: loadMetrics });

  useEffect(() => {
    if (authLoading || !authenticated || sessionExpired || !tokenReady) return;
    void loadMetrics();
  }, [authLoading, authenticated, sessionExpired, tokenReady]);

  const score = metrics?.readinessScore ?? 0;
  const readinessState = metrics?.readinessState ?? "pending";

  return (
    <VeraPageLayout
      title="Records & verification"
      description="Training ingest, credential verification, workers, equipment, and audit-friendly compliance workflows."
      actions={<SyncPulse onSync={() => void loadMetrics()} />}
    >
      <div className="space-y-10 vera-motion-stagger">
        <CoreHero
          eyebrow="Vera Core"
          title="Compliance that feels effortless"
          description="Evidence-first records, verified credentials, and project readiness — designed for the field."
          score={score}
          compliance={readinessCompliance(readinessState)}
          badges={[
            { label: "Evidence-first" },
            { label: "Audit-ready", state: "ok" },
            ...(metrics
              ? [{ label: `${metrics.providerChannelsHealthy}/${metrics.providerChannelsTotal} provider channels` }]
              : []),
          ]}
          actions={
            <>
              <Link href="/core/training-ingest" className={buttonStyles({ variant: "teal", size: "md" })}>
                <Upload className="h-4 w-4" aria-hidden />
                Training ingest
              </Link>
              <Link href="/core/verification" className={buttonStyles({ variant: "outline", size: "md", className: "border-white/30 bg-white/10 text-white hover:bg-white/20" })}>
                <FileCheck className="h-4 w-4" aria-hidden />
                Verification hub
              </Link>
            </>
          }
        />

        <CoreSection title="At a glance" description="Core compliance signals across your organization.">
          <CoreDashboardGrid columns={4}>
            <CoreMetricTile
              label="Workers"
              value={loading ? "…" : String(metrics?.workers ?? 0)}
              hint="Registry & links"
              icon={Users}
              compliance="ok"
            />
            <CoreMetricTile
              label="Verified training"
              value={loading ? "…" : String(metrics?.verifiedTraining30d ?? 0)}
              hint="Last 30 days"
              icon={GraduationCap}
              compliance="ok"
            />
            <CoreMetricTile
              label="Open verifications"
              value={loading ? "…" : String(metrics?.openVerifications ?? 0)}
              hint="Needs review"
              icon={FileCheck}
              compliance={(metrics?.openVerifications ?? 0) > 0 ? "pending" : "ok"}
            />
            <CoreMetricTile
              label="Readiness"
              value={loading ? "…" : `${metrics?.readinessScore ?? 0}%`}
              hint="Company average"
              icon={Shield}
              compliance={readinessCompliance(readinessState)}
            />
          </CoreDashboardGrid>
        </CoreSection>

        <PmWorkflowJourney
          steps={coreWorkflowSteps}
          sectionEyebrow="Records lifecycle"
          sectionTitle="Recommended workflow"
          sectionDescription="Move from ingest through verification, field documentation, and closed action items."
        />

        <CoreSection title="Core modules" description="Jump into the tools your team uses every day.">
          <CoreDashboardGrid columns={3}>
            {CORE_MODULE_LINKS.map((mod) => {
              const Icon = iconForModule(mod.href);
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group block rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--compliance-ok)]/30 hover:shadow-md"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--compliance-ok)] transition-colors group-hover:bg-[var(--compliance-ok-bg)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-base font-semibold text-[var(--foreground)]">{mod.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{mod.description}</p>
                </Link>
              );
            })}
          </CoreDashboardGrid>
        </CoreSection>
      </div>
    </VeraPageLayout>
  );
}
