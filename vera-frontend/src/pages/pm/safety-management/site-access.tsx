"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  evaluateSiteAccess,
  fetchSiteAccessGrants,
  fetchSiteAccessRules,
  type SiteAccessEvaluation,
} from "@/lib/safety-management";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";
import { SiteAccessTrainingVeraSection } from "@/src/components/verification/SiteAccessTrainingVeraSection";

export default function SiteAccessPage({
  projectId,
}: {
  projectId: number;
}) {
  const [workerId, setWorkerId] = useState("");
  const [evaluation, setEvaluation] = useState<SiteAccessEvaluation | null>(
    null,
  );
  const [grants, setGrants] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  const loadGrants = useCallback(() => {
    void fetchSiteAccessGrants(projectId).then(setGrants).catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    void fetchSiteAccessRules(projectId).catch(() => undefined);
    loadGrants();
  }, [projectId, loadGrants]);

  async function runEvaluate() {
    const wid = parseInt(workerId, 10);
    if (!wid) return;
    setLoading(true);
    try {
      const result = await evaluateSiteAccess({
        workerId: wid,
        projectId,
      });
      setEvaluation(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <VeraPageLayout
      title="Site access control"
      description={`Project #${projectId} — FLHA, orientation, training, and SIF gates.`}
    >
      <SfCard className="space-y-4 p-5">
        <h2 className="font-medium">Evaluate worker</h2>
        <div className="flex flex-wrap gap-3">
          <SfInput
            placeholder="Worker ID"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          />
          <SfButton type="button" onClick={() => void runEvaluate()} disabled={loading}>
            {loading ? "Checking…" : "Evaluate access"}
          </SfButton>
          <Link href="/pm/safety-forms/fill/worker-site-access">
            <SfButton variant="secondary" type="button">
              Site access form
            </SfButton>
          </Link>
        </div>
        {evaluation ? (
          <div
            className={
              evaluation.granted
                ? "rounded-lg border border-green-200 bg-green-50 p-4 text-sm"
                : "rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm"
            }
          >
            <p className="font-medium">
              {evaluation.granted ? "Access granted" : "Access denied"}
            </p>
            {evaluation.denialReasons.length > 0 ? (
              <ul className="mt-2 list-disc pl-5">
                {evaluation.denialReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}
            <SiteAccessTrainingVeraSection
              workerId={workerId ? parseInt(workerId, 10) || null : null}
              className="mt-4 border-t border-green-200/60 pt-4"
            />
          </div>
        ) : null}
      </SfCard>

      <SfCard className="p-5">
        <h2 className="mb-3 font-medium">Active grants</h2>
        {grants.length === 0 ? (
          <p className="text-sm text-[var(--sf-text-muted)]">No active grants.</p>
        ) : (
          <ul className="divide-y text-sm">
            {grants.map((g) => (
              <li key={String(g.id)} className="flex justify-between py-2">
                <span>
                  Worker #{String(g.workerId)}{" "}
                  {g.worker &&
                  typeof g.worker === "object" &&
                  "firstName" in g.worker
                    ? `${(g.worker as { firstName: string }).firstName} ${(g.worker as { lastName: string }).lastName}`
                    : ""}
                </span>
                <span className="text-[var(--sf-text-muted)]">
                  {g.grantedAt ? new Date(String(g.grantedAt)).toLocaleString() : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SfCard>
    </VeraPageLayout>
  );
}
