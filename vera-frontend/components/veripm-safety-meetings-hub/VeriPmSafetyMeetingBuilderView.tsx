"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InsightStrip,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  createSafetyMeeting,
  suggestTopics,
  type TopicSuggestion,
} from "@/lib/pm-safety-meetings";
import {
  buildRegulationAwareMeetingDraft,
  suggestRegulationTopics,
  type MeetingDraft,
  type RegulationFramework,
} from "@/lib/veripm-safety-meetings-hub/meeting-draft-engine";
import { SmsAiIntegrationPanel } from "@/components/verisuite-sms-ai/SmsAiIntegrationPanel";
import { PmAuthBanner } from "@/src/components/pm/layout";

const MEETING_TYPES = [
  { value: "toolbox_talk", label: "Toolbox talk" },
  { value: "tailgate_meeting", label: "Tailgate meeting" },
  { value: "safety_stand_down", label: "Safety stand-down" },
  { value: "daily_safety_briefing", label: "Daily safety briefing" },
  { value: "weekly_safety_meeting", label: "Weekly safety meeting" },
  { value: "incident_review_meeting", label: "Incident review" },
  { value: "custom", label: "Custom" },
] as const;

const RISK_COLOR: Record<MeetingDraft["risk"], string> = {
  low: VS_COLORS.emerald,
  medium: VS_COLORS.blue,
  high: VS_COLORS.orange,
  critical: VS_COLORS.critical,
};

const FRAMEWORK_COLOR: Record<RegulationFramework, string> = {
  CSA: VS_COLORS.blue,
  OHS: VS_COLORS.emerald,
  ANSI: VS_COLORS.orange,
  CCOHS: VS_COLORS.muted,
};

function FrameworkChip({ framework }: { framework: RegulationFramework }) {
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        background: VS_COLORS.slate,
        color: FRAMEWORK_COLOR[framework],
        border: `1px solid ${FRAMEWORK_COLOR[framework]}`,
      }}
    >
      {framework}
    </span>
  );
}

export function VeriPmSafetyMeetingBuilderView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicPrefill = searchParams.get("topic") ?? "";

  const {
    companyId: scopedCompanyId,
    projectId: scopedProjectId,
    query,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  } = usePmInspectionScope(companyId, projectId);

  const [title, setTitle] = useState(topicPrefill);
  const [meetingType, setMeetingType] = useState("toolbox_talk");
  const [locationNote, setLocationNote] = useState("");
  const [fieldSuggestions, setFieldSuggestions] = useState<TopicSuggestion[]>(
    [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftTick, setDraftTick] = useState(0);

  useEffect(() => {
    if (topicPrefill) setTitle(topicPrefill);
  }, [topicPrefill]);

  useEffect(() => {
    if (!tokenReady) return;
    suggestTopics(scopedProjectId, scopedCompanyId, { session })
      .then(setFieldSuggestions)
      .catch(() => setFieldSuggestions([]));
  }, [scopedProjectId, scopedCompanyId, tokenReady, session]);

  const draft = useMemo(
    () =>
      buildRegulationAwareMeetingDraft({
        title: title.trim() || "Safety meeting",
        meetingType,
        siteContext: locationNote || undefined,
      }),
    // draftTick forces regenerate after manual edits if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, meetingType, locationNote, draftTick],
  );

  const catalog = useMemo(
    () => suggestRegulationTopics(title),
    [title],
  );

  const chips = [
    {
      id: "type",
      label: "Format",
      value: MEETING_TYPES.find((t) => t.value === meetingType)?.label ?? meetingType,
      tone: "info" as const,
    },
    {
      id: "risk",
      label: "Risk",
      value: draft.risk,
      tone:
        draft.risk === "critical" || draft.risk === "high"
          ? ("alert" as const)
          : ("caution" as const),
    },
    {
      id: "mins",
      label: "Duration",
      value: `${draft.durationMinutes} min`,
      tone: "neutral" as const,
    },
    {
      id: "regs",
      label: "Standards",
      value: `${draft.regulations.length} cites`,
      tone: "positive" as const,
    },
  ];

  async function submit() {
    if (!tokenReady) {
      setError("Session is still preparing — wait a moment, then try again.");
      return;
    }
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const packageNotes = JSON.stringify({
        summary: draft.summary,
        facilitatorScript: draft.facilitatorScript,
        learningObjectives: draft.learningObjectives,
        regulations: draft.regulations,
        sections: draft.sections,
        attendanceChecks: draft.attendanceChecks,
        closingActions: draft.closingActions,
        category: draft.category,
        risk: draft.risk,
        durationMinutes: draft.durationMinutes,
        sourceLabel: draft.sourceLabel,
      });
      const m = await createSafetyMeeting(
        {
          companyId: scopedCompanyId,
          projectId: scopedProjectId,
          meetingType,
          title: draft.title,
          locationNote: locationNote.trim() || undefined,
          inlineTopics: [
            {
              title: draft.title,
              isHighRisk:
                draft.risk === "high" || draft.risk === "critical",
              sourceModule: "regulation_engine",
              sourceId: `draft:${draft.category}`,
              discussionPoints: draft.discussionPoints,
              requiredControls: draft.requiredControls,
              notes: packageNotes,
            },
          ],
        },
        { session },
      );
      if (!m?.id) {
        throw new Error(
          "Meeting was created but the server did not return an id.",
        );
      }
      router.push(`/pm/safety-meetings/${m.id}${query}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not create the meeting. Please try again.",
      );
      setSaving(false);
    }
  }

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Safety meetings"
      title="AI meeting builder"
      description="Generate regulation-grounded toolbox talks and stand-downs — CSA, provincial OHS, and ANSI citations with discussion points, controls, and a facilitator script."
      meta={`Project #${scopedProjectId} · Company #${scopedCompanyId} · ${draft.sourceLabel}`}
    >
      <PmAuthBanner
        authLoading={authLoading}
        authenticated={authenticated}
        tokenReady={tokenReady}
        sessionExpired={sessionExpired}
        signInMessage="Sign in to create a safety meeting."
      />

      <VsSection band="controls">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[220px] flex-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.muted }}
            >
              Meeting title
            </span>
            <input
              className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
              style={{
                background: VS_COLORS.panel,
                color: VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fall protection"
            />
          </label>
          <label className="min-w-[180px]">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.muted }}
            >
              Meeting type
            </span>
            <select
              className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
              style={{
                background: VS_COLORS.panel,
                color: VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
            >
              {MEETING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[180px] flex-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.muted }}
            >
              Location / crew (optional)
            </span>
            <input
              className="mt-1 w-full rounded px-3 py-2 text-sm outline-none"
              style={{
                background: VS_COLORS.panel,
                color: VS_COLORS.white,
                border: `1px solid ${VS_COLORS.border}`,
              }}
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              placeholder="e.g. Tower crane pad · Day shift"
            />
          </label>
          <button
            type="button"
            className="rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
            onClick={() => setDraftTick((n) => n + 1)}
          >
            Regenerate draft
          </button>
          <button
            type="button"
            disabled={saving || !tokenReady}
            className="rounded px-4 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
            style={{
              background: VS_COLORS.blue,
              color: VS_COLORS.navy,
            }}
            onClick={() => void submit()}
          >
            {saving ? "Saving draft…" : "Create draft meeting"}
          </button>
          <Link
            href={`/pm/safety-meetings${query}`}
            className="rounded px-3 py-2 text-xs font-semibold"
            style={{ color: VS_COLORS.muted }}
          >
            Cancel
          </Link>
        </div>
        {error ? (
          <p className="mt-3 text-sm" style={{ color: VS_COLORS.critical }} role="alert">
            {error}
          </p>
        ) : null}
      </VsSection>

      <InsightStrip chips={chips} />

      <VsSection band="detail" label="Smart topic picks">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {catalog.map((t) => {
            const active =
              title.trim().toLowerCase() === t.title.toLowerCase() ||
              (title.trim().length > 0 &&
                t.title.toLowerCase().includes(title.trim().toLowerCase()));
            return (
              <button
                key={t.id}
                type="button"
                className="vs-panel p-4 text-left"
                style={{
                  borderLeft: `3px solid ${RISK_COLOR[t.risk]}`,
                  outline: active ? `1px solid ${VS_COLORS.blue}` : undefined,
                }}
                onClick={() => setTitle(t.title)}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: VS_COLORS.muted }}
                >
                  {t.category} · {t.risk}
                </p>
                <p
                  className="mt-1 text-sm font-semibold"
                  style={{ color: VS_COLORS.white }}
                >
                  {t.title}
                </p>
                <p className="mt-2 text-xs" style={{ color: VS_COLORS.blue }}>
                  {t.rationale}
                </p>
              </button>
            );
          })}
        </div>
        {fieldSuggestions.length > 0 ? (
          <div className="mt-4">
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.muted }}
            >
              From field signals (inspections · incidents · JHA)
            </p>
            <div className="flex flex-wrap gap-2">
              {fieldSuggestions.slice(0, 6).map((s, i) => (
                <button
                  key={`${s.sourceId}-${i}`}
                  type="button"
                  className="rounded px-3 py-1.5 text-xs"
                  style={{
                    background: VS_COLORS.slate,
                    color: VS_COLORS.white,
                    border: `1px solid ${VS_COLORS.border}`,
                  }}
                  onClick={() => setTitle(s.title)}
                >
                  {s.title}
                  {s.isHighRisk ? " · high risk" : ""}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </VsSection>

      <VsSection band="detail" label="Generated meeting package">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div
              className="vs-panel p-4"
              style={{ borderLeft: `3px solid ${RISK_COLOR[draft.risk]}` }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: VS_COLORS.muted }}
              >
                {draft.category} · ~{draft.durationMinutes} min
              </p>
              <h2
                className="mt-1 text-lg font-semibold"
                style={{ color: VS_COLORS.white }}
              >
                {draft.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: VS_COLORS.muted }}>
                {draft.summary}
              </p>
              <p
                className="mt-3 rounded border px-3 py-2 text-sm italic"
                style={{
                  borderColor: VS_COLORS.border,
                  color: VS_COLORS.white,
                  background: VS_COLORS.slate,
                }}
              >
                “{draft.facilitatorScript}”
              </p>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Learning objectives</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm" style={{ color: VS_COLORS.muted }}>
                {draft.learningObjectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>

            {draft.sections.map((sec) => (
              <div key={sec.id} className="vs-panel p-4">
                <p className="vs-eyebrow">{sec.heading}</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm" style={{ color: VS_COLORS.muted }}>
                  {sec.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Discussion prompts</p>
              <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm" style={{ color: VS_COLORS.white }}>
                {draft.discussionPoints.map((p) => (
                  <li key={p} style={{ color: VS_COLORS.muted }}>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Regulation alignment</p>
              <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                Citations for facilitator prep — confirm local jurisdiction section numbers before delivery.
              </p>
              <ul className="mt-3 space-y-3">
                {draft.regulations.map((r) => (
                  <li
                    key={`${r.framework}-${r.code}`}
                    className="rounded border p-3"
                    style={{ borderColor: VS_COLORS.border, background: VS_COLORS.slate }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <FrameworkChip framework={r.framework} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: VS_COLORS.white }}
                      >
                        {r.code}
                      </span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: VS_COLORS.white }}>
                      {r.title}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                      {r.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Required controls</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm" style={{ color: VS_COLORS.muted }}>
                {draft.requiredControls.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Attendance checks</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm" style={{ color: VS_COLORS.muted }}>
                {draft.attendanceChecks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="vs-panel p-4">
              <p className="vs-eyebrow">Close-out actions</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm" style={{ color: VS_COLORS.muted }}>
                {draft.closingActions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <SmsAiIntegrationPanel
              page="meetings"
              companyId={scopedCompanyId}
              projectId={scopedProjectId}
              title="AI topic assist"
              defaultAcceptAction="create_meeting"
            />
          </div>
        </div>
      </VsSection>

      <VsSection band="narrative" label="How it works">
        <div className="vs-panel p-4 text-sm" style={{ color: VS_COLORS.muted }}>
          <ol className="list-decimal space-y-2 pl-4">
            <li>Pick a smart topic or type a title — the engine maps it to CSA / OHS / ANSI packs.</li>
            <li>Review discussion points, controls, and citations (edit title to reshape the draft).</li>
            <li>Create draft — topics land on the meeting with discussion points and controls saved.</li>
            <li>Run the talk, capture attendance, and open follow-ups from the meeting detail.</li>
          </ol>
        </div>
      </VsSection>
    </VsDashboardShell>
  );
}
