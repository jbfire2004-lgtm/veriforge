"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DOMAIN_LABELS,
  listSafetyHubNotifications,
  searchSafetyEvidence,
  getSafetyHubDashboard,
  type SafetyHubDomain,
  type SafetyHubSnapshot,
} from "@/lib/pm-safety-hub";
import { getSafetyEcosystemStatus, type SafetyEcosystemStatus } from "@/lib/pm-safety-ecosystem";
import { VeriPmSafetyHubIntelligenceView } from "@/components/veripm-safety-hub/VeriPmSafetyHubIntelligenceView";
import { WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SafetyHubDashboard({
  companyId = 1,
  projectId = 1,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const [hub, setHub] = useState<SafetyHubSnapshot | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; title: string; body: string }>
  >([]);
  const [evidence, setEvidence] = useState<
    Awaited<ReturnType<typeof searchSafetyEvidence>>
  >([]);
  const [evidenceQ, setEvidenceQ] = useState("");
  const [ecosystem, setEcosystem] = useState<SafetyEcosystemStatus | null>(null);
  const [opsLoading, setOpsLoading] = useState(true);
  const [opsError, setOpsError] = useState<string | null>(null);

  const loadOps = useCallback(async () => {
    setOpsLoading(true);
    setOpsError(null);
    try {
      const [dash, notif, ev, eco] = await Promise.all([
        getSafetyHubDashboard(companyId, projectId),
        listSafetyHubNotifications(true).catch(() => []),
        searchSafetyEvidence({ companyId, projectId }).catch(() => []),
        getSafetyEcosystemStatus().catch(() => null),
      ]);
      setHub(dash);
      setNotifications(notif);
      setEvidence(ev);
      setEcosystem(eco);
    } catch (err) {
      setHub(null);
      setOpsError(
        err instanceof Error ? err.message : "Failed to load Safety Hub ops",
      );
    } finally {
      setOpsLoading(false);
    }
  }, [companyId, projectId]);

  useEffect(() => {
    void loadOps();
  }, [loadOps]);

  async function onSearchEvidence() {
    const ev = await searchSafetyEvidence({
      companyId,
      projectId,
      q: evidenceQ || undefined,
    });
    setEvidence(ev);
  }

  return (
    <div className="space-y-10 pb-10">
      <VeriPmSafetyHubIntelligenceView
        companyId={companyId}
        projectId={projectId}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4">
        {opsError ? (
          <div className="rounded-xl border border-[#C89F3D]/40 bg-[#C89F3D]/10 px-4 py-3 text-sm text-[#2A2E33]">
            {opsError}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-3"
              onClick={() => void loadOps()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {ecosystem ? (
          <p className="text-xs text-[#64748b]">
            Ecosystem v{ecosystem.version} · {ecosystem.modules.length} integrated
            modules · event bus: {ecosystem.eventBus}
          </p>
        ) : null}

        <WorkspaceSection title="Cross-module timeline">
          {opsLoading && !hub ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <div className="max-h-72 divide-y divide-[#2A2E33]/10 overflow-y-auto rounded-xl border bg-white">
              {hub?.timeline.length ? (
                hub.timeline.map((e) => (
                  <div key={e.id} className="px-4 py-2">
                    <p className="text-xs text-[#64748b]">
                      {new Date(e.occurredAt).toLocaleString()} · {e.eventName}
                      {e.domain
                        ? ` · ${DOMAIN_LABELS[e.domain as SafetyHubDomain] ?? e.domain}`
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-[#64748b]">
                  No hub events yet — activity will appear as modules emit domain
                  events.
                </p>
              )}
            </div>
          )}
        </WorkspaceSection>

        <WorkspaceSection title="Evidence library">
          <div className="mb-4 flex gap-2">
            <input
              type="search"
              placeholder="Search evidence…"
              className="flex-1 rounded-xl border border-[#2A2E33]/15 px-3 py-2 text-sm"
              value={evidenceQ}
              onChange={(e) => setEvidenceQ(e.target.value)}
            />
            <Button type="button" size="sm" onClick={() => void onSearchEvidence()}>
              Search
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {evidence.length ? (
              evidence.map((e) => (
                <div key={e.id} className="rounded-xl border bg-white p-3">
                  {e.thumbnailDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.thumbnailDataUrl}
                      alt=""
                      className="mb-2 h-24 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <p className="text-sm font-medium text-[#2A2E33]">
                    {e.title ?? e.fileName ?? "Evidence"}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {DOMAIN_LABELS[e.domain]} · {e.sourceType}:
                    {e.sourceId.slice(0, 8)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#64748b]">
                No indexed evidence. Run reindex from API or upload via attachments
                media.
              </p>
            )}
          </div>
        </WorkspaceSection>

        <WorkspaceSection title="Safety notification center">
          <div className="divide-y divide-[#2A2E33]/10 rounded-xl border bg-white">
            {notifications.length ? (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-[#2A2E33]">{n.title}</p>
                  <p className="text-xs text-[#64748b]">{n.body}</p>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-[#64748b]">
                No unread safety notifications.
              </p>
            )}
          </div>
        </WorkspaceSection>
      </div>
    </div>
  );
}
