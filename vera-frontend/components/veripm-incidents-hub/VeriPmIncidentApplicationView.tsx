"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createPmIncidentDraft,
  listPmIncidents,
  type PmSafetyEvent,
} from "@/lib/pm-incidents";
import {
  InsightStrip,
  VsStatusBadge,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import type { InsightChip } from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmAuthBanner } from "@/src/components/pm/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

const STAGES = [
  {
    id: "information",
    n: "1",
    title: "Incident information",
    detail:
      "Date/time, location, company, project, type, severity, description, and immediate actions.",
  },
  {
    id: "evidence",
    n: "2",
    title: "Evidence",
    detail:
      "Photos, documents, witness statements, and training / competency records.",
  },
  {
    id: "root_cause",
    n: "3",
    title: "Root cause",
    detail: "5-Why, fishbone (Ishikawa), TapRooT pathways, guided interview, causal tree.",
  },
  {
    id: "corrective_actions",
    n: "4",
    title: "Corrective actions",
    detail:
      "Actions linked to Action Management — owners, due dates, verification.",
  },
  {
    id: "final_review",
    n: "5",
    title: "Final review",
    detail: "Readiness gate, approve / request changes, investigation report, close.",
  },
] as const;

type AppTab = "investigate" | "queue" | "analytics";

export function VeriPmIncidentApplicationView({
  projectId = 1,
  companyId = 1,
  initialTab,
}: {
  projectId?: number;
  companyId?: number;
  initialTab?: string | null;
}) {
  const router = useRouter();
  const {
    query,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
    session,
  } = usePmInspectionScope(companyId, projectId);

  const [tab, setTab] = useState<AppTab>(() => {
    if (initialTab === "history" || initialTab === "queue" || initialTab === "log")
      return "queue";
    if (initialTab === "dashboard" || initialTab === "analytics") return "analytics";
    return "investigate";
  });
  const [events, setEvents] = useState<PmSafetyEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickLocation, setQuickLocation] = useState("");
  const [quickType, setQuickType] = useState("near_miss");
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await listPmIncidents(projectId);
      setEvents(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load incidents from the server.",
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!tokenReady) return;
    void load();
  }, [load, tokenReady, session?.accessToken]);

  const open = useMemo(
    () =>
      events.filter((e) => !["closed", "locked", "rejected"].includes(e.status)),
    [events],
  );

  const chips: InsightChip[] = [
    {
      id: "total",
      label: "Total",
      value: String(events.length),
      tone: "info",
    },
    {
      id: "open",
      label: "Open",
      value: String(open.length),
      tone: open.length ? "caution" : "positive",
    },
    {
      id: "rca",
      label: "With RCA",
      value: String(events.filter((e) => e.rootCauses?.length).length),
      tone: "info",
    },
    {
      id: "capa",
      label: "With actions",
      value: String(events.filter((e) => e.correctiveActions?.length).length),
      tone: "positive",
    },
  ];

  async function startInvestigation() {
    if (!quickTitle.trim()) {
      setCreateMsg("Enter an incident title to start.");
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const row = await createPmIncidentDraft({
        companyId,
        projectId,
        title: quickTitle.trim(),
        description: quickDesc.trim() || undefined,
        eventType: quickType,
        locationNote: quickLocation.trim() || undefined,
      });
      router.push(
        `/pm/incidents/${row.id}${query}${query.includes("?") ? "&" : "?"}stage=information`,
      );
    } catch (e) {
      setCreateMsg(
        e instanceof Error ? e.message : "Could not create incident draft.",
      );
      setCreating(false);
    }
  }

  function hrefFor(id: string) {
    return `/pm/incidents/${id}${query}`;
  }

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Incident application"
      title="Incident investigation"
      description="Enterprise investigation workspace — Intelex / ISN class stages: information, evidence, multi-method root cause, linked corrective actions, and final review."
      meta={`Company ${companyId} · Project ${projectId}`}
    >
      <PmAuthBanner
        authLoading={authLoading}
        authenticated={authenticated}
        tokenReady={tokenReady}
        sessionExpired={sessionExpired}
        signInMessage="Sign in to load live incidents and start investigations."
      />

      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["investigate", "Investigate"],
              ["queue", "Open queue"],
              ["analytics", "Analytics hub"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{
                background: tab === id ? VS_COLORS.blue : VS_COLORS.slate,
                color: tab === id ? VS_COLORS.navy : VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <Link
            href={`/pm/action-management${query}`}
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            Action Management
          </Link>
        </div>
      </VsSection>

      <InsightStrip chips={chips} />

      {tab === "investigate" ? (
        <>
          <VsSection
            band="detail"
            label="Investigation stages"
            description="Five-stage investigation — information through final review."
            icon={ShieldAlert}
          >
            <div className="grid gap-3 md:grid-cols-5">
              {STAGES.map((s) => (
                <div
                  key={s.id}
                  className="vs-panel p-4"
                  style={{ borderTop: `2px solid ${VS_COLORS.blue}` }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: VS_COLORS.muted }}
                  >
                    Stage {s.n}
                  </p>
                  <h3
                    className="mt-1 text-sm font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="mt-2 text-xs leading-relaxed"
                    style={{ color: VS_COLORS.muted }}
                  >
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </VsSection>

          <VsSection band="detail" label="Start a new investigation">
            <div className="vs-panel space-y-3 p-4">
              <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                Creates a live incident draft and opens the full five-stage
                investigation workspace (information → evidence → root cause →
                actions → review).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded border bg-transparent px-3 py-2 text-sm"
                  style={{
                    borderColor: VS_COLORS.border,
                    color: VS_COLORS.white,
                  }}
                  placeholder="Incident title *"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                />
                <select
                  className="rounded border bg-transparent px-3 py-2 text-sm"
                  style={{
                    borderColor: VS_COLORS.border,
                    color: VS_COLORS.white,
                  }}
                  value={quickType}
                  onChange={(e) => setQuickType(e.target.value)}
                >
                  <option value="near_miss">Near miss</option>
                  <option value="incident_injury">Injury incident</option>
                  <option value="incident_property">Property damage</option>
                  <option value="incident_environmental">Environmental</option>
                  <option value="incident_equipment">Equipment</option>
                  <option value="hazard_observation">Hazard observation</option>
                  <option value="equipment_failure">Equipment failure</option>
                  <option value="behavioral_observation">
                    Behavioral observation
                  </option>
                </select>
                <input
                  className="rounded border bg-transparent px-3 py-2 text-sm sm:col-span-2"
                  style={{
                    borderColor: VS_COLORS.border,
                    color: VS_COLORS.white,
                  }}
                  placeholder="Location (site / area / equipment)"
                  value={quickLocation}
                  onChange={(e) => setQuickLocation(e.target.value)}
                />
                <textarea
                  className="min-h-[88px] rounded border bg-transparent px-3 py-2 text-sm sm:col-span-2"
                  style={{
                    borderColor: VS_COLORS.border,
                    color: VS_COLORS.white,
                  }}
                  placeholder="What happened? Sequence of events, people involved, conditions…"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={creating || !tokenReady}
                  onClick={() => void startInvestigation()}
                >
                  {creating
                    ? "Opening workspace…"
                    : "Start investigation workspace →"}
                </Button>
                {createMsg ? (
                  <p className="text-xs" style={{ color: VS_COLORS.orange }}>
                    {createMsg}
                  </p>
                ) : null}
              </div>
            </div>
          </VsSection>

          <VsSection band="detail" label="Continue an open investigation">
            {loading ? (
              <Skeleton className="h-32 w-full rounded" />
            ) : loadError ? (
              <p className="text-sm" style={{ color: VS_COLORS.critical }}>
                {loadError}
              </p>
            ) : open.length === 0 ? (
              <p className="text-sm" style={{ color: VS_COLORS.muted }}>
                No open incidents yet. Start one above to enter the staged
                workspace.
              </p>
            ) : (
              <ul className="space-y-2">
                {open.slice(0, 12).map((e) => (
                  <li key={e.id}>
                    <Link
                      href={hrefFor(e.id)}
                      className="vs-panel flex flex-wrap items-center justify-between gap-2 p-4 transition hover:opacity-95"
                    >
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: VS_COLORS.white }}
                        >
                          {e.title}
                        </p>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: VS_COLORS.muted }}
                        >
                          {e.eventType.replaceAll("_", " ")} · {e.severity}
                          {e.locationNote ? ` · ${e.locationNote}` : ""}
                          {e.rootCauses?.length
                            ? ` · ${e.rootCauses.length} RCA`
                            : ""}
                          {e.correctiveActions?.length
                            ? ` · ${e.correctiveActions.length} actions`
                            : ""}
                        </p>
                        <div className="mt-2">
                          <VsStatusBadge
                            tone={
                              e.status === "closed"
                                ? "positive"
                                : e.status === "draft"
                                  ? "neutral"
                                  : e.severity === "critical" ||
                                      e.severity === "high"
                                    ? "critical"
                                    : "info"
                            }
                          >
                            {e.status.replaceAll("_", " ")}
                          </VsStatusBadge>
                        </div>
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: VS_COLORS.blue }}
                      >
                        Open stages →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </VsSection>
        </>
      ) : null}

      {tab === "queue" ? (
        <VsSection band="detail" label="All project incidents (live)">
          {loading ? (
            <Skeleton className="h-40 w-full rounded" />
          ) : (
            <div className="vs-panel overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr style={{ color: VS_COLORS.muted }}>
                    <th className="p-3 font-medium">Incident</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Severity</th>
                    <th className="p-3 font-medium">RCA</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr
                      key={e.id}
                      style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                    >
                      <td className="p-3">
                        <Link
                          href={hrefFor(e.id)}
                          className="hover:underline"
                          style={{ color: VS_COLORS.white }}
                        >
                          {e.title}
                        </Link>
                      </td>
                      <td className="p-3" style={{ color: VS_COLORS.muted }}>
                        {e.eventType.replaceAll("_", " ")}
                      </td>
                      <td className="p-3" style={{ color: VS_COLORS.blue }}>
                        {e.status.replaceAll("_", " ")}
                      </td>
                      <td className="p-3" style={{ color: VS_COLORS.orange }}>
                        {e.severity}
                      </td>
                      <td className="p-3 tabular-nums">{e.rootCauses?.length ?? 0}</td>
                      <td className="p-3 tabular-nums">
                        {e.correctiveActions?.length ?? 0}
                      </td>
                    </tr>
                  ))}
                  {!events.length ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-sm"
                        style={{ color: VS_COLORS.muted }}
                      >
                        No incidents in this project yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </VsSection>
      ) : null}

      {tab === "analytics" ? (
        <VsSection band="detail" label="Analytics & industry benchmarks">
          <p className="mb-3 text-xs" style={{ color: VS_COLORS.muted }}>
            Benchmark dashboards remain available here. Investigation work happens
            on the Investigate tab and inside each incident’s five-stage workspace.
          </p>
          <Link
            href={`/pm/incidents?projectId=${projectId}&companyId=${companyId}&tab=dashboard&hub=legacy`}
            className="text-sm font-semibold"
            style={{ color: VS_COLORS.blue }}
          >
            Open legacy analytics hub →
          </Link>
        </VsSection>
      ) : null}
    </VsDashboardShell>
  );
}
