"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createEquipmentLoto,
  fetchEquipmentAnalytics,
  fetchEquipmentIntelligence,
  listEquipmentProfiles,
  reportEquipmentFailure,
  type EquipmentProfile,
} from "@/lib/pm-equipment-safety";
import { SfButton, SfInput } from "@/src/components/safety-forms/ui";
import {
  PmFilterChips,
  PmMetricCard,
  PmMetricGrid,
  PmPageShell,
  PmSurfaceCard,
} from "@/src/components/pm/layout";

type Tab = "fleet" | "failures" | "loto" | "insights";

const TABS = [
  { id: "fleet", label: "Fleet" },
  { id: "failures", label: "Failures" },
  { id: "loto", label: "LOTO" },
  { id: "insights", label: "CAIL insights" },
] as const;

export default function PmEquipmentSafetyDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [tab, setTab] = useState<Tab>("fleet");
  const [fleet, setFleet] = useState<EquipmentProfile[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [failureTitle, setFailureTitle] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);

  function reload() {
    void listEquipmentProfiles(companyId, projectId).then(setFleet).catch(() => undefined);
    void fetchEquipmentAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    void fetchEquipmentIntelligence(projectId).then(setInsights).catch(() => undefined);
  }

  useEffect(() => {
    reload();
  }, [projectId, companyId]);

  async function reportFailure() {
    if (!selectedEquipmentId || !failureTitle.trim()) return;
    await reportEquipmentFailure({
      companyId,
      projectId,
      equipmentId: selectedEquipmentId,
      failureType: "mechanical",
      title: failureTitle.trim(),
      autoLockout: true,
    });
    setFailureTitle("");
    reload();
  }

  async function lockoutSelected() {
    if (!selectedEquipmentId) return;
    await createEquipmentLoto({
      companyId,
      equipmentId: selectedEquipmentId,
      reason: "Manual lockout from PM equipment safety",
    });
    reload();
  }

  return (
    <PmPageShell
      title="Equipment safety"
      description={`Profiles, certifications, inspections, LOTO, failures, and CAIL risk scoring — project #${projectId}`}
      filters={
        <PmFilterChips
          items={[...TABS]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
          ariaLabel="Equipment safety views"
        />
      }
    >
      {analytics ? (
        <PmMetricGrid columns={5}>
          <PmMetricCard label="Fleet" value={String(analytics.equipmentCount)} />
          <PmMetricCard label="Locked out" value={String(analytics.lockedOut)} tone="danger" />
          <PmMetricCard
            label="Overdue insp."
            value={String(analytics.overdueInspection)}
            tone="warning"
          />
          <PmMetricCard label="Project score" value={String(analytics.projectEquipmentScore)} />
          <PmMetricCard label="Open failures" value={String(analytics.openFailures)} />
        </PmMetricGrid>
      ) : null}

      <PmSurfaceCard title="Selected equipment">
        <select
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={selectedEquipmentId ?? ""}
          onChange={(e) =>
            setSelectedEquipmentId(e.target.value ? parseInt(e.target.value, 10) : null)
          }
        >
          <option value="">— Select —</option>
          {fleet.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.operationalStatus})
            </option>
          ))}
        </select>
      </PmSurfaceCard>

      {tab === "fleet" ? (
        <PmSurfaceCard title={`Equipment profiles (${fleet.length})`}>
          <ul className="divide-y divide-[var(--border)] text-sm">
            {fleet.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="font-medium">{e.name}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {" "}
                    · {e.operationalStatus} · {e.complianceStatus}
                    {e.lockoutStatus === "LOCKED_OUT" ? " · LOTO" : ""}
                  </span>
                </span>
                <Link
                  href={`/pm/equipment-safety/${e.id}?projectId=${projectId}`}
                  className="shrink-0 font-medium text-[var(--primary)] hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      ) : null}

      {tab === "failures" ? (
        <PmSurfaceCard title="Report failure">
          <div className="space-y-3">
            <SfInput
              placeholder="Failure title"
              value={failureTitle}
              onChange={(e) => setFailureTitle(e.target.value)}
            />
            <SfButton type="button" onClick={() => void reportFailure()}>
              Report + auto LOTO + CAPA
            </SfButton>
          </div>
        </PmSurfaceCard>
      ) : null}

      {tab === "loto" ? (
        <PmSurfaceCard title="Lockout / tagout">
          <SfButton type="button" onClick={() => void lockoutSelected()}>
            Create LOTO on selected equipment
          </SfButton>
        </PmSurfaceCard>
      ) : null}

      {tab === "insights" ? (
        <PmSurfaceCard title="CAIL equipment intelligence">
          <ul className="space-y-3 text-sm">
            {insights.map((i, idx) => (
              <li key={idx} className="rounded-lg border border-[var(--border)] p-3">
                <p className="font-medium">{String(i.title)}</p>
                <p className="text-[var(--muted-foreground)]">{String(i.explanation)}</p>
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      ) : null}
    </PmPageShell>
  );
}
