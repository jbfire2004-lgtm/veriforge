"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  SafetyMeetingsHubDashboard,
  SmartTopic,
  TopicRisk,
} from "@/lib/veripm-safety-meetings-hub";
import {
  InsightStrip,
  KpiTile,
  LeadingHeatmap,
  TrendPanel,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { useCachedAggregate } from "@/lib/verisuite-intelligence-ui/useCachedAggregate";
import { Skeleton } from "@/components/ui/skeleton";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { SmsInteractionFlowPanel } from "@/components/verisuite-sms-ai/SmsInteractionFlowPanel";
import { VeriPmAiIntelligencePanel } from "@/components/veripm-ai-intelligence";
import {
  listSafetyMeetings,
  type SafetyMeeting,
} from "@/lib/pm-safety-meetings";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";

type Tab = "generator" | "library" | "planner";

function parseTab(raw: string | null): Tab {
  if (raw === "library" || raw === "planner" || raw === "generator") return raw;
  return "generator";
}

const RISK_COLOR: Record<TopicRisk, string> = {
  low: VS_COLORS.emerald,
  medium: VS_COLORS.blue,
  high: VS_COLORS.orange,
  critical: VS_COLORS.critical,
};

function riskLabel(r: TopicRisk) {
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function TopicCard({
  topic,
  projectId,
  companyId,
  actionLabel = "Add to planner",
}: {
  topic: SmartTopic;
  projectId: number;
  companyId: number;
  actionLabel?: string;
}) {
  const href = `/pm/safety-meetings/new?projectId=${projectId}&companyId=${companyId}&topic=${encodeURIComponent(topic.title)}`;
  return (
    <div
      className="vs-panel p-4"
      style={{ borderLeft: `3px solid ${RISK_COLOR[topic.risk]}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: VS_COLORS.muted }}
          >
            {topic.category} · {topic.sourceLabel}
          </p>
          <h3
            className="mt-1 text-sm font-semibold"
            style={{ color: VS_COLORS.white }}
          >
            {topic.title}
          </h3>
        </div>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            background: VS_COLORS.slate,
            color: RISK_COLOR[topic.risk],
            border: `1px solid ${RISK_COLOR[topic.risk]}`,
          }}
        >
          {riskLabel(topic.risk)}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: VS_COLORS.muted }}>
        {topic.description}
      </p>
      <p className="mt-2 text-xs" style={{ color: VS_COLORS.blue }}>
        {topic.reason}
      </p>
      <div
        className="mt-3 flex flex-wrap gap-3 text-[11px]"
        style={{ color: VS_COLORS.muted }}
      >
        <span>{topic.relatedIncidents} related incidents</span>
        <span>{topic.relatedFindings} inspection findings</span>
        <span>Every {topic.recommendedFrequencyDays}d</span>
      </div>
      <Link
        href={href}
        className="mt-3 inline-block text-xs font-semibold"
        style={{ color: VS_COLORS.blue }}
      >
        {actionLabel} →
      </Link>
    </div>
  );
}

export function VeriPmSafetyMeetingsHubView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { session, tokenReady, query } = usePmInspectionScope(
    companyId,
    projectId,
  );
  const [tab, setTab] = useState<Tab>(() =>
    parseTab(searchParams.get("tab")),
  );
  const [liveMeetings, setLiveMeetings] = useState<SafetyMeeting[]>([]);

  const tabParam = searchParams.get("tab");
  useEffect(() => {
    setTab(parseTab(tabParam));
  }, [tabParam]);

  useEffect(() => {
    if (!tokenReady) return;
    listSafetyMeetings(projectId, undefined, { session })
      .then((rows) => setLiveMeetings(Array.isArray(rows) ? rows : []))
      .catch(() => setLiveMeetings([]));
  }, [projectId, tokenReady, session?.accessToken]);
  function selectTab(id: Tab) {
    setTab(id);
    const q = new URLSearchParams(searchParams.toString());
    q.set("tab", id);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    // Bring the switched panel into view below KPI / trend bands.
    requestAnimationFrame(() => {
      document.getElementById("sms-meetings-tab-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  const url = useMemo(
    () =>
      `/api/v1/veripm-safety-meetings-hub?projectId=${projectId}&companyId=${companyId}&existingTopicCount=0`,
    [projectId, companyId],
  );

  const { data: dash, loading, error, fromCache } =
    useCachedAggregate<SafetyMeetingsHubDashboard>(url);

  const chips = dash
    ? [
        {
          id: "held",
          label: "Meetings held",
          value: String(dash.kpis.meetingsHeld),
          tone: "info" as const,
        },
        {
          id: "att",
          label: "Attendance",
          value: `${Math.round(dash.kpis.attendanceRate * 100)}%`,
          tone: "positive" as const,
        },
        {
          id: "lead",
          label: "Leading contribution",
          value: `${dash.kpis.leadingContribution}`,
          tone: "positive" as const,
        },
        {
          id: "seed",
          label: dash.autoSeeded ? "Library" : "Follow-ups",
          value: dash.autoSeeded
            ? "Auto-seeded"
            : `${dash.kpis.openFollowUps} open`,
          tone: dash.autoSeeded ? ("neutral" as const) : ("caution" as const),
        },
      ]
    : [];

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Safety Meetings"
      title="Smart safety meeting hub"
      description="Interactive dashboard with AI topic generation from inspections, incidents, near-misses, corrective actions, and industry trends. Topic library and planner — never empty."
      meta={
        dash
          ? `Project #${dash.projectId} · ${dash.periodLabel} · rev ${dash.revision}${
              dash.autoSeeded ? " · topics auto-generated" : ""
            }${fromCache ? " · cached" : ""}`
          : undefined
      }
    >
      <VsSection band="controls">
        <div
          className="flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Safety meeting views"
        >
          {(
            [
              ["generator", "Smart topics"],
              ["library", "Topic library"],
              ["planner", "Meeting planner"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              id={`sms-meetings-tab-${id}`}
              className="rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{
                background: tab === id ? VS_COLORS.blue : VS_COLORS.slate,
                color: tab === id ? VS_COLORS.navy : VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              onClick={() => selectTab(id)}
            >
              {label}
            </button>
          ))}
          <Link
            href={`/pm/safety-meetings/new?projectId=${projectId}&companyId=${companyId}`}
            className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.blue,
              color: VS_COLORS.navy,
            }}
          >
            AI meeting builder
          </Link>
        </div>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {loading && !dash ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded" />
          ))}
        </div>
      ) : null}

      {dash ? (
        <>
          <InsightStrip chips={chips} cachedHint={fromCache} />

          {tab === "generator" ? (
            <>
              <VsSection band="kpi" label="Meeting dashboard">
                <KpiTile
                  label="Meetings held"
                  value={dash.kpis.meetingsHeld}
                  delta={dash.kpis.deltas.meetingsHeld}
                  tone="info"
                />
                <KpiTile
                  label="Attendance rate"
                  value={Math.round(dash.kpis.attendanceRate * 100)}
                  unit="%"
                  delta={dash.kpis.deltas.attendanceRate * 100}
                  tone="positive"
                  sparkline={dash.attendanceTrend.map((p) => p.value)}
                />
                <KpiTile
                  label="Leading indicator contribution"
                  value={dash.kpis.leadingContribution}
                  unit="/100"
                  delta={dash.kpis.deltas.leadingContribution}
                  tone="positive"
                />
                <KpiTile
                  label="Open follow-up actions"
                  value={dash.kpis.openFollowUps}
                  tone="caution"
                />
              </VsSection>

              <VsSection band="trend" label="Attendance & coverage">
                <TrendPanel
                  title="Attendance trend %"
                  series={dash.attendanceTrend}
                  rangeLabel={dash.periodLabel}
                />
                <LeadingHeatmap
                  title="Topic coverage heatmap (meetings by theme × week)"
                  rows={dash.topicCoverage.rows}
                  cols={dash.topicCoverage.cols}
                  cells={dash.topicCoverage.cells}
                />
              </VsSection>
            </>
          ) : null}

          <div
            id="sms-meetings-tab-panel"
            role="tabpanel"
            aria-labelledby={`sms-meetings-tab-${tab}`}
          >
            {tab === "generator" ? (
              <VsSection band="detail" label="Smart Topic Generator">
                <div className="mb-3 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-3">
                    {dash.smartTopics.map((t) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        projectId={projectId}
                        companyId={companyId}
                        actionLabel="Schedule meeting"
                      />
                    ))}
                  </div>
                  <SmsAiIntegrationPanel
                    page="meetings"
                    companyId={companyId}
                    projectId={projectId}
                    title="Why these topics"
                    fallbackInsights={dash.insights}
                    defaultAcceptAction="create_meeting"
                  />
                  <SmsInteractionFlowPanel
                    page="meetings"
                    companyId={companyId}
                    projectId={projectId}
                    title="Meeting schedule flow"
                    showCrossLinks={false}
                  />
                </div>
                <p className="text-xs" style={{ color: VS_COLORS.muted }}>
                  Sources: Smart Inspections · incidents · near-misses · corrective
                  actions · industry packs (mining, construction, manufacturing).
                </p>
              </VsSection>
            ) : null}

            {tab === "library" ? (
              <VsSection band="detail" label="Topic library">
                {dash.autoSeeded ? (
                  <p
                    className="mb-3 rounded border px-3 py-2 text-xs"
                    style={{
                      borderColor: VS_COLORS.blue,
                      color: VS_COLORS.muted,
                      background: VS_COLORS.slate,
                    }}
                  >
                    No prior topics existed — VeriPM auto-generated this library so
                    the page is never empty.
                  </p>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  {dash.topicLibrary.map((t) => (
                    <TopicCard
                      key={t.id}
                      topic={t}
                      projectId={projectId}
                      companyId={companyId}
                      actionLabel="Use in meeting"
                    />
                  ))}
                </div>
              </VsSection>
            ) : null}

            {tab === "planner" ? (
              <VsSection band="detail" label="Meeting planner">
                {liveMeetings.length > 0 ? (
                  <div className="vs-panel mb-4 overflow-x-auto p-0">
                    <p
                      className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        color: VS_COLORS.blue,
                        borderColor: VS_COLORS.border,
                      }}
                    >
                      Your drafts & scheduled meetings
                    </p>
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr style={{ color: VS_COLORS.muted }}>
                          <th className="p-3 font-medium">Meeting</th>
                          <th className="p-3 font-medium">Type</th>
                          <th className="p-3 font-medium">Status</th>
                          <th className="p-3 font-medium">Topics</th>
                          <th className="p-3 font-medium">Open</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveMeetings.map((m) => (
                          <tr
                            key={m.id}
                            style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                          >
                            <td className="p-3" style={{ color: VS_COLORS.white }}>
                              {m.title}
                            </td>
                            <td className="p-3" style={{ color: VS_COLORS.muted }}>
                              {m.meetingType.replaceAll("_", " ")}
                            </td>
                            <td className="p-3">
                              <span
                                className="text-xs font-semibold uppercase"
                                style={{ color: VS_COLORS.blue }}
                              >
                                {m.status.replaceAll("_", " ")}
                              </span>
                            </td>
                            <td
                              className="p-3 tabular-nums"
                              style={{ color: VS_COLORS.muted }}
                            >
                              {m.topics?.length ?? 0}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={`/pm/safety-meetings/${m.id}${query}`}
                                  className="text-xs font-semibold"
                                  style={{ color: VS_COLORS.blue }}
                                >
                                  Open →
                                </Link>
                                {m.status === "published" ||
                                m.status === "in_progress" ? (
                                  <Link
                                    href={`/pm/safety-meetings/${m.id}/sign-on${query}`}
                                    className="text-xs font-semibold"
                                    style={{ color: VS_COLORS.emerald }}
                                  >
                                    Sign-on →
                                  </Link>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p
                    className="mb-3 rounded border px-3 py-2 text-xs"
                    style={{
                      borderColor: VS_COLORS.border,
                      color: VS_COLORS.muted,
                      background: VS_COLORS.slate,
                    }}
                  >
                    No saved drafts yet — use AI meeting builder to create one.
                    Sample planner rows below are illustrative.
                  </p>
                )}
                <div className="vs-panel overflow-x-auto p-0">
                  <p
                    className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      color: VS_COLORS.muted,
                      borderColor: VS_COLORS.border,
                    }}
                  >
                    Sample coverage plan
                  </p>
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr style={{ color: VS_COLORS.muted }}>
                        <th className="p-3 font-medium">Meeting</th>
                        <th className="p-3 font-medium">Topic</th>
                        <th className="p-3 font-medium">When</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Attendance</th>
                        <th className="p-3 font-medium">Follow-ups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dash.planner.map((m) => (
                        <tr
                          key={m.id}
                          style={{ borderTop: `1px solid ${VS_COLORS.border}` }}
                        >
                          <td className="p-3" style={{ color: VS_COLORS.white }}>
                            {m.title}
                          </td>
                          <td className="p-3" style={{ color: VS_COLORS.muted }}>
                            {m.topicTitle}
                          </td>
                          <td
                            className="p-3 tabular-nums"
                            style={{ color: VS_COLORS.muted }}
                          >
                            {new Date(m.scheduledAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span
                              className="text-xs font-semibold uppercase"
                              style={{
                                color:
                                  m.status === "completed"
                                    ? VS_COLORS.emerald
                                    : VS_COLORS.blue,
                              }}
                            >
                              {m.status.replace("_", " ")}
                            </span>
                          </td>
                          <td
                            className="p-3 tabular-nums"
                            style={{ color: VS_COLORS.muted }}
                          >
                            {m.checkedIn}/{m.expectedAttendance}
                          </td>
                          <td className="p-3">
                            <span style={{ color: VS_COLORS.orange }}>
                              {m.followUpActions} auto
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs" style={{ color: VS_COLORS.muted }}>
                  Completing a meeting auto-generates follow-up corrective /
                  preventive actions when high-risk topics or findings are linked.
                  Create a new session from Smart topics or the library.
                </p>
                <Link
                  href={`/pm/safety-meetings/new?projectId=${projectId}&companyId=${companyId}`}
                  className="mt-3 inline-block text-xs font-semibold"
                  style={{ color: VS_COLORS.blue }}
                >
                  AI meeting builder →
                </Link>
              </VsSection>
            ) : null}
          </div>

          <VsSection band="narrative" label="Help / How-to">
            <div className="vs-panel p-4 text-sm" style={{ color: VS_COLORS.muted }}>
              <ol className="list-decimal space-y-2 pl-4">
                <li>Review Smart topics generated from field signals.</li>
                <li>Pick a topic → schedule in the planner (or New meeting).</li>
                <li>Track attendance at the session via Worker sign-on (marks on-project).</li>
                <li>
                  Confirm auto follow-up actions in Action Management when
                  prompted.
                </li>
              </ol>
            </div>
          </VsSection>

          <VeriPmAiIntelligencePanel
            page="safety-meetings"
            projectId={projectId}
            companyId={companyId}
          />
        </>
      ) : null}
    </VsDashboardShell>
  );
}
