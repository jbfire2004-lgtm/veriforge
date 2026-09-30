"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, Upload, Users } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { CoreHero } from "../CoreHero";
import { CoreDashboardGrid } from "../CoreDashboardGrid";
import { CoreMetricTile } from "../CoreMetricTile";
import { CoreSection } from "../CoreSection";
import { CredentialCard, type CredentialCardData } from "../CredentialCard";
import { ComplianceBadge } from "../ComplianceBadge";
import { SyncPulse } from "../SyncPulse";
import { useVeraCoreUI } from "@/lib/vera-core-ui/store";

export type ProviderPortalData = {
  provider: {
    id: number;
    name: string;
    approvalStatus: string;
  };
  stats: {
    activeCourses: number;
    activeInstructors: number;
    trainingRecordsIssued: number;
  };
  compliance?: {
    rate?: number;
    issues?: number;
  };
  recentRecords?: Array<{
    id: number;
    workerName?: string;
    courseName?: string;
    issuedAt?: string;
    status?: string;
  }>;
};

type Props = {
  data: ProviderPortalData;
};

export function ProviderPortalDashboard({ data }: Props) {
  const { markSynced } = useVeraCoreUI();
  const { provider, stats, compliance, recentRecords = [] } = data;
  const approved = provider.approvalStatus === "APPROVED";

  const credentials: CredentialCardData[] = recentRecords.slice(0, 4).map((r) => ({
    id: r.id,
    title: r.courseName ?? `Record #${r.id}`,
    issuer: provider.name,
    issuedAt: r.issuedAt,
    verifiedStatus: r.status ?? "PENDING",
  }));

  return (
    <div className="space-y-8 vera-motion-stagger">
      <CoreHero
        eyebrow="Training provider"
        title={provider.name}
        description="Issue completions, sync to Vera wallets, and track compliance in real time."
        score={compliance?.rate ?? (approved ? 88 : 42)}
        compliance={approved ? "ok" : "pending"}
        badges={[
          {
            label: provider.approvalStatus,
            state: approved ? "ok" : "pending",
          },
        ]}
        actions={
          <>
            <SyncPulse onSync={() => markSynced()} />
            <Link href="/provider-portal/upload" className={buttonStyles({ variant: "teal", size: "sm" })}>
              <Upload className="h-4 w-4" aria-hidden />
              Upload completions
            </Link>
          </>
        }
      />

      <CoreSection title="Provider metrics">
        <CoreDashboardGrid columns={3}>
          <CoreMetricTile label="Active courses" value={stats.activeCourses} icon={BookOpen} compliance="ok" />
          <CoreMetricTile label="Instructors" value={stats.activeInstructors} icon={Users} compliance="ok" />
          <CoreMetricTile
            label="Records issued"
            value={stats.trainingRecordsIssued}
            icon={ClipboardList}
            compliance="ok"
          />
        </CoreDashboardGrid>
      </CoreSection>

      {credentials.length > 0 ? (
        <CoreSection title="Recent credentials" description="Latest completions pushed to Vera.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((c) => (
              <CredentialCard key={c.id} credential={c} />
            ))}
          </div>
        </CoreSection>
      ) : null}

      <CoreSection title="Quick links">
        <div className="flex flex-wrap gap-2">
          <Link href="/provider-portal/courses" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Courses
          </Link>
          <Link href="/provider-portal/compliance" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Compliance
            {compliance?.issues ? (
              <ComplianceBadge state="at_risk" className="ml-2" />
            ) : null}
          </Link>
          <Link href="/provider-portal/history" className={buttonStyles({ variant: "outline", size: "sm" })}>
            History
          </Link>
        </div>
      </CoreSection>
    </div>
  );
}
