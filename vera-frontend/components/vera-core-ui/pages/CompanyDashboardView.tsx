"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Building2, GraduationCap, HardHat, Users } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { complianceFromScore } from "@/lib/vera-core-ui/compliance";
import { CoreHero } from "../CoreHero";
import { CoreDashboardGrid } from "../CoreDashboardGrid";
import { CoreMetricTile } from "../CoreMetricTile";
import { CoreSection } from "../CoreSection";
import { WorkerLinkBoard } from "../WorkerLinkBoard";
import type { WorkerChipData } from "../WorkerChip";
import { SyncPulse } from "../SyncPulse";
import { useVeraCoreUI } from "@/lib/vera-core-ui/store";

export type CompanyDashboardProps = {
  companyId: number;
  companyName: string;
  workerCount?: number;
  equipmentCount?: number;
  trainingCount?: number;
  readinessScore?: number;
  workers?: Array<{
    id: number;
    firstName?: string;
    lastName?: string;
    trade?: string | null;
  }>;
  projects?: Array<{ id: number; name: string }>;
  children?: React.ReactNode;
};

export function CompanyDashboardView({
  companyId,
  companyName,
  workerCount = 0,
  equipmentCount = 0,
  trainingCount = 0,
  readinessScore = 0,
  workers = [],
  projects = [],
  children,
}: CompanyDashboardProps) {
  const { markSynced } = useVeraCoreUI();
  const compliance = complianceFromScore(readinessScore);

  const workerChips: WorkerChipData[] = useMemo(
    () =>
      workers.map((w) => ({
        id: w.id,
        name: `${w.firstName ?? ""} ${w.lastName ?? ""}`.trim() || `Worker ${w.id}`,
        trade: w.trade,
        compliance: "ok",
      })),
    [workers],
  );

  const targets = [
    {
      id: `company-${companyId}`,
      label: companyName,
      kind: "company" as const,
      companyId,
    },
    ...projects.slice(0, 3).map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      kind: "project" as const,
      companyId,
      projectId: p.id,
    })),
  ];

  return (
    <div className="space-y-8 vera-motion-stagger">
      <CoreHero
        eyebrow="Company"
        title={companyName}
        description="Workers, training compliance, and project readiness in one place."
        score={readinessScore}
        compliance={compliance}
        actions={
          <>
            <SyncPulse onSync={() => markSynced()} />
            <Link
              href={`/companies/${companyId}/projects`}
              className={buttonStyles({ variant: "outline", size: "sm", className: "border-white/30 bg-white/10 text-white hover:bg-white/20" })}
            >
              View projects
            </Link>
          </>
        }
      />

      <CoreSection title="Overview">
        <CoreDashboardGrid columns={4}>
          <CoreMetricTile label="Workers" value={workerCount} icon={Users} compliance="ok" />
          <CoreMetricTile label="Equipment" value={equipmentCount} icon={HardHat} compliance="ok" />
          <CoreMetricTile label="Training records" value={trainingCount} icon={GraduationCap} compliance="ok" />
          <CoreMetricTile
            label="Readiness"
            value={`${readinessScore}%`}
            icon={Building2}
            compliance={compliance}
          />
        </CoreDashboardGrid>
      </CoreSection>

      {workerChips.length > 0 ? (
        <WorkerLinkBoard workers={workerChips} targets={targets} />
      ) : null}

      {children}
    </div>
  );
}
