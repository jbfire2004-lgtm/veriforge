"use client";

import Link from "next/link";
import { Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { complianceFromScore } from "@/lib/vera-core-ui/compliance";
import { CoreHero } from "../CoreHero";
import { CoreDashboardGrid } from "../CoreDashboardGrid";
import { CoreMetricTile } from "../CoreMetricTile";
import { CoreSection } from "../CoreSection";
import { ComplianceBadge } from "../ComplianceBadge";
import { SyncPulse } from "../SyncPulse";
import { useVeraCoreUI } from "@/lib/vera-core-ui/store";

export type ProjectComplianceRow = {
  id: number;
  workerName: string;
  certification: string;
  bucket: "Verified" | "Pending" | "Rejected" | "Expiring";
  expiresAt?: string | null;
};

export type ProjectDashboardProps = {
  companyId: number;
  projectId: number;
  projectName: string;
  companyName?: string;
  readinessScore?: number;
  verified?: number;
  pending?: number;
  rejected?: number;
  expiring?: number;
  rows?: ProjectComplianceRow[];
};

function bucketState(bucket: ProjectComplianceRow["bucket"]) {
  switch (bucket) {
    case "Verified":
      return "ok" as const;
    case "Expiring":
      return "at_risk" as const;
    case "Rejected":
      return "non_compliant" as const;
    default:
      return "pending" as const;
  }
}

export function ProjectDashboardView({
  companyId,
  projectId,
  projectName,
  companyName,
  readinessScore = 0,
  verified = 0,
  pending = 0,
  rejected = 0,
  expiring = 0,
  rows = [],
}: ProjectDashboardProps) {
  const { markSynced } = useVeraCoreUI();
  const compliance = complianceFromScore(readinessScore, rejected);

  return (
    <div className="space-y-8 vera-motion-stagger">
      <CoreHero
        eyebrow={companyName ?? "Project"}
        title={projectName}
        description="Training compliance and worker readiness for this project."
        score={readinessScore}
        compliance={compliance}
        actions={
          <>
            <SyncPulse onSync={() => markSynced()} />
            <Link
              href={`/companies/${companyId}`}
              className={buttonStyles({ variant: "outline", size: "sm", className: "border-white/30 bg-white/10 text-white hover:bg-white/20" })}
            >
              <Building2 className="h-4 w-4" aria-hidden />
              Company
            </Link>
          </>
        }
      />

      <CoreSection title="Compliance buckets">
        <CoreDashboardGrid columns={4}>
          <CoreMetricTile label="Verified" value={verified} icon={CheckCircle2} compliance="ok" />
          <CoreMetricTile label="Pending" value={pending} icon={Clock} compliance="pending" />
          <CoreMetricTile label="Expiring" value={expiring} icon={Clock} compliance="at_risk" />
          <CoreMetricTile label="Rejected" value={rejected} icon={XCircle} compliance="non_compliant" />
        </CoreDashboardGrid>
      </CoreSection>

      <CoreSection
        title="Worker training"
        description="Color-coded compliance states — verified, pending, expiring, and rejected."
      >
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No training records for this project yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={`${row.id}-${row.bucket}`}>
                    <TableCell className="font-medium">{row.workerName}</TableCell>
                    <TableCell>{row.certification}</TableCell>
                    <TableCell>
                      <ComplianceBadge state={bucketState(row.bucket)} />
                    </TableCell>
                    <TableCell className="text-[var(--muted-foreground)]">
                      {row.expiresAt
                        ? new Date(row.expiresAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CoreSection>

      <p className="text-xs text-[var(--muted-foreground)]">
        Project ID {projectId} · Company ID {companyId}
      </p>
    </div>
  );
}
