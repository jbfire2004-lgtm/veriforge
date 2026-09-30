"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  completeMeeting,
  getSafetyMeeting,
  publishMeeting,
  scoreMeeting,
  startMeeting,
  type SafetyMeeting,
} from "@/lib/pm-safety-meetings";
import {
  InsightStrip,
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { MeetingWorkerSignOnPanel } from "@/components/veripm-safety-meetings-hub/MeetingWorkerSignOnPanel";
import { PmAuthBanner } from "@/src/components/pm/layout";

type StoredPackage = {
  summary?: string;
  facilitatorScript?: string;
  learningObjectives?: string[];
  regulations?: Array<{
    framework: string;
    code: string;
    title: string;
    note: string;
  }>;
  sections?: Array<{ heading: string; points: string[] }>;
  attendanceChecks?: string[];
  closingActions?: string[];
  category?: string;
  risk?: string;
  durationMinutes?: number;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function parsePackage(notes?: string | null): StoredPackage | null {
  if (!notes?.trim()) return null;
  try {
    const parsed = JSON.parse(notes) as StoredPackage;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* plain text notes */
  }
  return null;
}

export default function SafetyMeetingDetailPage({
  meetingId,
  projectId,
  companyId = 1,
}: {
  meetingId: string;
  projectId: number;
  companyId?: number;
}) {
  const {
    query,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  } = usePmInspectionScope(companyId, projectId);

  const [meeting, setMeeting] = useState<SafetyMeeting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState<Record<string, unknown> | null>(null);

  async function reload() {
    setLoadError(null);
    try {
      const row = await getSafetyMeeting(meetingId, { session });
      setMeeting(row);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load this meeting.",
      );
    }
  }

  useEffect(() => {
    if (!tokenReady) return;
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, tokenReady, session?.accessToken]);

  const primaryTopic = meeting?.topics?.[0];
  const pack = useMemo(
    () => parsePackage(primaryTopic?.notes),
    [primaryTopic?.notes],
  );
  const discussionPoints = asStringArray(primaryTopic?.discussionPoints);
  const requiredControls = asStringArray(primaryTopic?.requiredControls);

  const chips = meeting
    ? [
        {
          id: "status",
          label: "Status",
          value: meeting.status.replaceAll("_", " "),
          tone: "info" as const,
        },
        {
          id: "type",
          label: "Type",
          value: meeting.meetingType.replaceAll("_", " "),
          tone: "neutral" as const,
        },
        {
          id: "topics",
          label: "Topics",
          value: String(meeting.topics?.length ?? 0),
          tone: "positive" as const,
        },
        {
          id: "att",
          label: "Attendees",
          value: String(meeting.attendees?.length ?? 0),
          tone: "caution" as const,
        },
      ]
    : [];

  async function runAction(
    action: () => Promise<unknown>,
    label: string,
  ) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await reload();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : `Could not ${label}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Safety meetings"
      title={meeting?.title ?? "Safety meeting"}
      description="Draft meeting package with discussion points, required controls, and workflow actions."
      meta={
        meeting
          ? `${meeting.meetingType.replaceAll("_", " ")} · ${meeting.status}${
              meeting.locationNote ? ` · ${meeting.locationNote}` : ""
            }`
          : undefined
      }
    >
      <PmAuthBanner
        authLoading={authLoading}
        authenticated={authenticated}
        tokenReady={tokenReady}
        sessionExpired={sessionExpired}
        signInMessage="Sign in to open this meeting."
      />

      <VsSection band="controls">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/pm/safety-meetings${query}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ color: VS_COLORS.muted }}
          >
            ← Hub
          </Link>
          <Link
            href={`/pm/safety-meetings/new${query}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            New meeting
          </Link>
          <Link
            href={`/pm/safety-meetings/${meetingId}/sign-on${query}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ background: VS_COLORS.emerald, color: VS_COLORS.navy }}
          >
            Worker sign-on
          </Link>
          {meeting?.status === "draft" ? (
            <button
              type="button"
              disabled={busy || !tokenReady}
              className="rounded px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: VS_COLORS.blue, color: VS_COLORS.navy }}
              onClick={() =>
                void runAction(() => publishMeeting(meetingId), "publish")
              }
            >
              Publish
            </button>
          ) : null}
          {meeting &&
          ["published", "in_progress"].includes(meeting.status) ? (
            <button
              type="button"
              disabled={busy || !tokenReady}
              className="rounded px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: VS_COLORS.emerald, color: VS_COLORS.navy }}
              onClick={() =>
                void runAction(
                  () =>
                    meeting.status === "published"
                      ? startMeeting(meetingId)
                      : completeMeeting(meetingId),
                  meeting.status === "published" ? "start" : "complete",
                )
              }
            >
              {meeting.status === "published" ? "Start meeting" : "Complete"}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || !tokenReady}
            className="rounded px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
            onClick={() =>
              void runAction(async () => {
                const s = await scoreMeeting(meetingId);
                setScore(s as Record<string, unknown>);
              }, "score")
            }
          >
            Run quality score
          </button>
        </div>
        {loadError ? (
          <p className="mt-3 text-sm" style={{ color: VS_COLORS.critical }}>
            {loadError}
          </p>
        ) : null}
        {actionError ? (
          <p className="mt-3 text-sm" style={{ color: VS_COLORS.critical }}>
            {actionError}
          </p>
        ) : null}
      </VsSection>

      {!meeting && !loadError ? (
        <p className="text-sm" style={{ color: VS_COLORS.muted }}>
          Loading meeting…
        </p>
      ) : null}

      {meeting ? (
        <>
          <InsightStrip chips={chips} />

          <VsSection band="detail" label="Meeting package">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-4">
                <div className="vs-panel p-4">
                  <p className="vs-eyebrow">
                    {pack?.category ?? "Topic"}
                    {pack?.durationMinutes
                      ? ` · ~${pack.durationMinutes} min`
                      : ""}
                  </p>
                  <h2
                    className="mt-1 text-lg font-semibold"
                    style={{ color: VS_COLORS.white }}
                  >
                    {primaryTopic?.title ?? meeting.title}
                  </h2>
                  {pack?.summary ? (
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {pack.summary}
                    </p>
                  ) : null}
                  {pack?.facilitatorScript ? (
                    <p
                      className="mt-3 rounded border px-3 py-2 text-sm italic"
                      style={{
                        borderColor: VS_COLORS.border,
                        color: VS_COLORS.white,
                        background: VS_COLORS.slate,
                      }}
                    >
                      “{pack.facilitatorScript}”
                    </p>
                  ) : null}
                </div>

                {pack?.learningObjectives?.length ? (
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">Learning objectives</p>
                    <ul
                      className="mt-2 list-disc space-y-1 pl-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {pack.learningObjectives.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="vs-panel p-4">
                  <p className="vs-eyebrow">Discussion prompts</p>
                  {discussionPoints.length ? (
                    <ol
                      className="mt-2 list-decimal space-y-2 pl-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {discussionPoints.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-sm" style={{ color: VS_COLORS.muted }}>
                      No discussion points saved on this draft.
                    </p>
                  )}
                </div>

                {pack?.sections?.map((sec) => (
                  <div key={sec.heading} className="vs-panel p-4">
                    <p className="vs-eyebrow">{sec.heading}</p>
                    <ul
                      className="mt-2 list-disc space-y-1 pl-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {sec.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="vs-panel p-4">
                  <p className="vs-eyebrow">Required controls</p>
                  {requiredControls.length ? (
                    <ul
                      className="mt-2 list-disc space-y-1 pl-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {requiredControls.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm" style={{ color: VS_COLORS.muted }}>
                      No controls recorded yet.
                    </p>
                  )}
                </div>

                {pack?.regulations?.length ? (
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">Regulation alignment</p>
                    <ul className="mt-3 space-y-3">
                      {pack.regulations.map((r) => (
                        <li
                          key={`${r.framework}-${r.code}`}
                          className="rounded border p-3"
                          style={{
                            borderColor: VS_COLORS.border,
                            background: VS_COLORS.slate,
                          }}
                        >
                          <p
                            className="text-[10px] font-semibold uppercase"
                            style={{ color: VS_COLORS.blue }}
                          >
                            {r.framework} · {r.code}
                          </p>
                          <p
                            className="mt-1 text-sm"
                            style={{ color: VS_COLORS.white }}
                          >
                            {r.title}
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: VS_COLORS.muted }}
                          >
                            {r.note}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {pack?.attendanceChecks?.length ? (
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">Attendance checks</p>
                    <ul
                      className="mt-2 list-disc space-y-1 pl-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {pack.attendanceChecks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {pack?.closingActions?.length ? (
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">Close-out actions</p>
                    <ul
                      className="mt-2 list-disc space-y-1 pl-4 text-sm"
                      style={{ color: VS_COLORS.muted }}
                    >
                      {pack.closingActions.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {score ? (
                  <div className="vs-panel p-4 text-sm" style={{ color: VS_COLORS.muted }}>
                    <p className="vs-eyebrow">CAIL score</p>
                    <p className="mt-2" style={{ color: VS_COLORS.white }}>
                      Quality: {String(score.qualityScore)} · Engagement:{" "}
                      {String(score.engagementScore)}
                    </p>
                  </div>
                ) : null}

                <div className="vs-panel p-4">
                  <p className="vs-eyebrow">
                    Attendees ({meeting.attendees?.length ?? 0})
                  </p>
                  {(meeting.attendees?.length ?? 0) === 0 ? (
                    <p className="mt-2 text-sm" style={{ color: VS_COLORS.muted }}>
                      No one signed on yet — open Worker sign-on or use the panel
                      below (same on-project tracking as FLHA crew ack).
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm" style={{ color: VS_COLORS.muted }}>
                      {meeting.attendees.map((a) => (
                        <li key={a.id}>
                          <span
                            style={{
                              color:
                                a.status === "present"
                                  ? VS_COLORS.emerald
                                  : VS_COLORS.muted,
                            }}
                          >
                            {a.worker
                              ? `${a.worker.firstName} ${a.worker.lastName}`
                              : `Worker #${a.workerId}`}{" "}
                            — {a.status}
                            {a.checkedInAt
                              ? ` · ${new Date(a.checkedInAt).toLocaleString()}`
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(meeting.signatures?.length ?? 0) > 0 ? (
                    <p className="mt-3 text-xs" style={{ color: VS_COLORS.blue }}>
                      {meeting.signatures.length} signature
                      {meeting.signatures.length === 1 ? "" : "s"} on file
                    </p>
                  ) : null}
                </div>

                <MeetingWorkerSignOnPanel
                  meetingId={meetingId}
                  projectId={projectId}
                  meetingStatus={meeting.status}
                  session={session}
                  tokenReady={tokenReady}
                  onSignedOn={setMeeting}
                />

                {(meeting.correctiveLinks?.length ?? 0) > 0 ? (
                  <div className="vs-panel p-4">
                    <p className="vs-eyebrow">Linked actions</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {meeting.correctiveLinks.map((l) => (
                        <li key={l.correctiveAction.id}>
                          <Link
                            href={`/pm/action-management/${l.correctiveAction.id}`}
                            style={{ color: VS_COLORS.blue }}
                          >
                            {l.correctiveAction.title}
                          </Link>{" "}
                          <span style={{ color: VS_COLORS.muted }}>
                            ({l.correctiveAction.status})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </VsSection>
        </>
      ) : null}
    </VsDashboardShell>
  );
}
