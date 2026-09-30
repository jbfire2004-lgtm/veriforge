"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchActiveMuster,
  fetchEmergencyPlans,
  musterAllClear,
  musterCheckIn,
  triggerMuster,
} from "@/lib/safety-management";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";

export default function EmergencyMusterPage({
  siteId,
  projectId,
}: {
  siteId: number;
  projectId?: number;
}) {
  const [plans, setPlans] = useState<Array<Record<string, unknown>>>([]);
  const [muster, setMuster] = useState<Record<string, unknown> | null>(null);
  const [workerId, setWorkerId] = useState("");

  const reload = useCallback(() => {
    void fetchEmergencyPlans(siteId).then(setPlans).catch(() => undefined);
    void fetchActiveMuster(siteId).then(setMuster).catch(() => setMuster(null));
  }, [siteId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <VeraPageLayout
      title="Emergency response"
      description={
        <>
          Site #{siteId} — muster tracking and evacuation plans.{" "}
          <Link
            href={`/pm/emergency-response?siteId=${siteId}&projectId=${projectId ?? 1}`}
            className="text-[var(--sf-primary)] hover:underline"
          >
            Open full emergency response →
          </Link>
        </>
      }
    >
      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Muster</h2>
        {muster ? (
          <div className="space-y-3">
            <p className="text-sm">
              Active muster · status: <strong>{String(muster.status)}</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              <SfInput
                placeholder="Worker ID to check in"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              />
              <SfButton
                type="button"
                onClick={() => {
                  const wid = parseInt(workerId, 10);
                  if (!wid || !muster.id) return;
                  void musterCheckIn(String(muster.id), { workerId: wid }).then(
                    reload,
                  );
                }}
              >
                Check in
              </SfButton>
              <SfButton
                variant="secondary"
                type="button"
                onClick={() =>
                  void musterAllClear(String(muster.id)).then(reload)
                }
              >
                All clear
              </SfButton>
            </div>
            {Array.isArray(muster.checkins) ? (
              <p className="text-xs text-[var(--sf-text-muted)]">
                {muster.checkins.length} checked in
              </p>
            ) : null}
          </div>
        ) : (
          <SfButton
            type="button"
            onClick={() =>
              void triggerMuster({ siteId, projectId }).then(reload)
            }
          >
            Trigger muster
          </SfButton>
        )}
        <Link href="/pm/safety-forms/fill/emergency-response">
          <SfButton variant="secondary" type="button">
            Log emergency response form
          </SfButton>
        </Link>
      </SfCard>

      <SfCard className="p-5">
        <h2 className="mb-2 font-medium">Emergency plans</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-[var(--sf-text-muted)]">
            No plans on file. Add via API or admin.
          </p>
        ) : (
          <ul className="text-sm">
            {plans.map((p) => (
              <li key={String(p.id)} className="py-1">
                {String(p.title)} ({String(p.planType)})
              </li>
            ))}
          </ul>
        )}
      </SfCard>
    </VeraPageLayout>
  );
}
