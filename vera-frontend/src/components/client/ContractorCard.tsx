"use client";

import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { awardContractor } from "@/lib/hiring-client-api";
import { useState } from "react";

export function ContractorCard({
  contractor,
}: {
  contractor: {
    id: string;
    companyName: string;
    slug: string;
    industry?: string | null;
    modulesEnabled?: string[];
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{contractor.companyName}</CardTitle>
        <p className="font-mono text-xs text-zinc-500">{contractor.slug}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {contractor.industry ? (
          <p className="text-zinc-600">{contractor.industry}</p>
        ) : null}
        <div className="flex flex-wrap gap-1">
          {(contractor.modulesEnabled ?? []).slice(0, 4).map((code) => (
            <StatusIndicator key={code} label={code} tone="neutral" />
          ))}
        </div>
        <Link className="inline-block underline" href={`/client/contractors/${contractor.id}`}>
          Open contractor
        </Link>
      </CardContent>
    </Card>
  );
}

export function ContractorScorecardView({
  scorecard,
}: {
  scorecard: {
    globalScorecard?: Record<string, number | string>;
    projectScorecards?: Array<Record<string, unknown>>;
  } | null;
}) {
  if (!scorecard) {
    return <p className="text-sm text-zinc-500">Select a contractor to view scorecard.</p>;
  }
  const global = scorecard.globalScorecard ?? {};
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(global).map(([k, v]) => (
          <div key={k} className="border border-zinc-200 bg-white p-3">
            <p className="text-xs uppercase text-zinc-500">{k}</p>
            <p className="text-xl font-semibold">{String(v)}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-2">
        {(scorecard.projectScorecards ?? []).map((p, i) => (
          <li key={String(p.projectId ?? i)} className="border border-zinc-200 px-3 py-2 text-sm">
            <span className="font-medium">{String(p.projectName ?? "Project")}</span>
            <span className="ml-2 text-zinc-500">overall {String(p.overall ?? "—")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContractorComplianceView({
  compliance,
}: {
  compliance: {
    artifacts?: Array<{ id: string; type: string; status: string }>;
    reminders?: unknown[];
  } | null;
}) {
  if (!compliance) {
    return <p className="text-sm text-zinc-500">No compliance data loaded.</p>;
  }
  const artifacts = compliance.artifacts ?? [];
  if (!artifacts.length) {
    return <p className="text-sm text-zinc-500">No compliance artifacts.</p>;
  }
  return (
    <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
      {artifacts.map((a) => (
        <li key={a.id} className="flex justify-between px-4 py-2 text-sm">
          <span className="capitalize">{a.type}</span>
          <StatusIndicator
            label={a.status.replace(/_/g, " ")}
            tone={
              a.status === "valid"
                ? "success"
                : a.status === "pending_review"
                  ? "warning"
                  : "danger"
            }
          />
        </li>
      ))}
    </ul>
  );
}

export function AwardContractButton({
  contractorId,
  disabled,
  onAwarded,
}: {
  contractorId: string;
  disabled?: boolean;
  onAwarded?: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      disabled={disabled || busy}
      onClick={async () => {
        setBusy(true);
        try {
          await awardContractor(contractorId, {
            projectName: "Primary award",
          });
          onAwarded?.("Contract awarded");
        } catch (err) {
          onAwarded?.(err instanceof Error ? err.message : "Award failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Awarding…" : "Award contract"}
    </Button>
  );
}
