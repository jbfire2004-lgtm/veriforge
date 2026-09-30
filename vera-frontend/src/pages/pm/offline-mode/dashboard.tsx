"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPmOfflineModeDevice,
  fetchPmOfflineAnalytics,
  resolvePmOfflineModeConflict,
} from "@/lib/pm-offline-mode";
import { getOfflineDeviceId } from "@/lib/field/device-id";
import { useOptionalFieldMode } from "@/components/field/FieldModeProvider";
import { ConflictResolverPanel } from "@/components/field/ConflictResolverPanel";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export default function PmOfflineModeDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
  deviceId?: string;
}) {
  const field = useOptionalFieldMode();
  const [deviceId] = useState(() =>
    typeof window !== "undefined" ? getOfflineDeviceId() : "field-device-1",
  );
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    void fetchPmOfflineModeDevice(deviceId, projectId).then(setStatus).catch(() => undefined);
    void fetchPmOfflineAnalytics(projectId).then(setAnalytics).catch(() => undefined);
  }, [deviceId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runSync() {
    setMessage("Syncing…");
    try {
      if (field) {
        await field.syncNow();
        setMessage("Local queue synced");
      } else {
        setMessage("Field mode not active — enable field provider");
      }
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sync failed");
    }
  }

  async function resolveFirstConflict() {
    const conflicts = (status?.openConflicts as Array<Record<string, unknown>>) ?? [];
    const first = conflicts[0];
    if (!first?.id) {
      setMessage("No open server conflicts");
      return;
    }
    await resolvePmOfflineModeConflict({
      conflictId: String(first.id),
      strategy: "prefer_local",
      retrySync: true,
    });
    setMessage("Server conflict resolved");
    reload();
  }

  async function preloadCache() {
    if (!field?.cache) {
      setMessage("Cache not ready");
      return;
    }
    await field.preload(companyId, projectId);
    setMessage("Cache preloaded");
  }

  const counts = (status?.counts as Record<string, number>) ?? {};
  const cail = (status?.cail as Record<string, unknown>) ?? {};

  return (
    <VeraPageLayout
      title="Vera Offline Mode"
      description={`Local-first IndexedDB cache, sync queue, delta updates, and conflict resolution — project #${projectId}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Local pending</p>
          <p className="text-2xl font-semibold">{field?.pendingCount ?? "—"}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Local failed</p>
          <p className="text-2xl font-semibold">{field?.failedCount ?? "—"}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Online</p>
          <p className="text-2xl font-semibold">{field?.isOnline ? "Yes" : "No"}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs uppercase text-[var(--sf-text-muted)]">Last sync</p>
          <p className="text-sm font-medium">{field?.lastSyncAt ?? "—"}</p>
        </SfCard>
      </div>

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Server cache (30d)</p>
            <p className="text-2xl font-semibold">{String(analytics.cacheEntries30d ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Sync success rate</p>
            <p className="text-2xl font-semibold">
              {analytics.syncSuccessRate != null
                ? `${Math.round(Number(analytics.syncSuccessRate) * 100)}%`
                : "—"}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Conflicts (30d)</p>
            <p className="text-2xl font-semibold">{String(analytics.conflicts30d ?? 0)}</p>
          </SfCard>
        </div>
      ) : null}

      <SfCard className="space-y-4 p-6">
        <p className="text-sm">
          Device ID: <code className="text-xs">{deviceId}</code>
        </p>
        <div className="flex flex-wrap gap-2">
          <SfButton onClick={() => void reload()}>Refresh status</SfButton>
          <SfButton onClick={() => void runSync()}>Sync local queue</SfButton>
          <SfButton variant="secondary" onClick={() => void preloadCache()}>
            Preload cache
          </SfButton>
          <SfButton variant="secondary" onClick={() => void resolveFirstConflict()}>
            Resolve server conflict
          </SfButton>
        </div>
        {message ? <p className="text-sm text-[var(--sf-text-muted)]">{message}</p> : null}
      </SfCard>

      {status ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SfCard className="p-6">
            <h2 className="mb-3 font-medium">Server queue status</h2>
            <ul className="space-y-1 text-sm">
              <li>Pending: {counts.pending_sync ?? 0}</li>
              <li>Syncing: {counts.syncing ?? 0}</li>
              <li>Synced: {counts.synced ?? 0}</li>
              <li>Conflict: {counts.conflict ?? 0}</li>
              <li>Resolved: {counts.resolved ?? 0}</li>
            </ul>
          </SfCard>
          <SfCard className="p-6">
            <h2 className="mb-3 font-medium">CAIL offline scores</h2>
            <ul className="space-y-1 text-sm">
              <li>Risk: {String(cail.offlineRiskScore ?? "—")}</li>
              <li>Queue pressure: {String(cail.queuePressure ?? "—")}</li>
              <li>Hazard: {String(cail.offlineHazardScore ?? "—")}</li>
              <li>Equipment: {String(cail.offlineEquipmentScore ?? "—")}</li>
              <li>Access: {String(cail.offlineAccessScore ?? "—")}</li>
            </ul>
          </SfCard>
        </div>
      ) : null}

      <SfCard className="p-6">
        <h2 className="mb-3 font-medium">Local conflict resolver</h2>
        <ConflictResolverPanel />
      </SfCard>

      <SfCard className="p-6">
        <h2 className="mb-2 font-medium">Cached entity types</h2>
        <p className="text-sm text-[var(--sf-text-muted)]">
          Workers, equipment, training records, projects, tasks, work packages, safety form
          definitions, inspections, and form drafts — encrypted in IndexedDB with AES-256-GCM.
        </p>
      </SfCard>
    </VeraPageLayout>
  );
}
