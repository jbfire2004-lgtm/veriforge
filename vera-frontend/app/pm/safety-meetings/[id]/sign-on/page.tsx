"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  getSafetyMeeting,
  type SafetyMeeting,
} from "@/lib/pm-safety-meetings";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  VsDashboardShell,
  VsSection,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import { MeetingWorkerSignOnPanel } from "@/components/veripm-safety-meetings-hub/MeetingWorkerSignOnPanel";
import { PmAuthBanner } from "@/src/components/pm/layout";

function SignOnInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const meetingId = params.id;
  const projectId = parseInt(searchParams.get("projectId") ?? "1", 10);
  const companyId = parseInt(searchParams.get("companyId") ?? "1", 10);

  const {
    query,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  } = usePmInspectionScope(companyId, projectId);

  const [meeting, setMeeting] = useState<SafetyMeeting | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenReady || !meetingId) return;
    getSafetyMeeting(meetingId, { session })
      .then(setMeeting)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load meeting"),
      );
  }, [meetingId, tokenReady, session]);

  return (
    <VsDashboardShell
      eyebrow="VeriPM · Field sign-on"
      title="Safety meeting sign-on"
      description="Workers sign on here to confirm attendance and that they are on the project — the same presence pattern used for FLHA crew acknowledgment."
      meta={
        meeting
          ? `${meeting.title} · ${meeting.status.replaceAll("_", " ")}`
          : undefined
      }
    >
      <PmAuthBanner
        authLoading={authLoading}
        authenticated={authenticated}
        tokenReady={tokenReady}
        sessionExpired={sessionExpired}
        signInMessage="Sign in to open worker sign-on."
      />

      <VsSection band="controls">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/pm/safety-meetings/${meetingId}${query}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ color: VS_COLORS.muted }}
          >
            ← Meeting package
          </Link>
          <Link
            href={`/pm/safety-meetings${query}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{ color: VS_COLORS.muted }}
          >
            Hub
          </Link>
          <Link
            href={`/pm/jha-flha${query}`}
            className="rounded px-3 py-1.5 text-xs font-semibold"
            style={{
              background: VS_COLORS.slate,
              color: VS_COLORS.white,
              border: `1px solid ${VS_COLORS.border}`,
            }}
          >
            FLHA / JHA crew sign →
          </Link>
        </div>
      </VsSection>

      {error ? (
        <p className="text-sm" style={{ color: VS_COLORS.critical }}>
          {error}
        </p>
      ) : null}

      {!meeting && !error ? (
        <p className="text-sm" style={{ color: VS_COLORS.muted }}>
          Loading meeting…
        </p>
      ) : null}

      {meeting ? (
        <VsSection band="detail" label="Sign on kiosk">
          <div className="mx-auto max-w-xl">
            <MeetingWorkerSignOnPanel
              meetingId={meeting.id}
              projectId={projectId}
              meetingStatus={meeting.status}
              session={session}
              tokenReady={tokenReady}
              variant="kiosk"
              onSignedOn={setMeeting}
            />
            <div className="mt-4 vs-panel p-4">
              <p className="vs-eyebrow">Present so far</p>
              <ul className="mt-2 space-y-1 text-sm" style={{ color: VS_COLORS.muted }}>
                {(meeting.attendees ?? [])
                  .filter((a) => a.status === "present")
                  .map((a) => (
                    <li key={a.id} style={{ color: VS_COLORS.emerald }}>
                      {a.worker
                        ? `${a.worker.firstName} ${a.worker.lastName}`
                        : `Worker #${a.workerId}`}{" "}
                      — signed on
                      {a.checkedInAt
                        ? ` · ${new Date(a.checkedInAt).toLocaleTimeString()}`
                        : ""}
                    </li>
                  ))}
                {(meeting.attendees ?? []).filter((a) => a.status === "present")
                  .length === 0 ? (
                  <li>No workers signed on yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </VsSection>
      ) : null}
    </VsDashboardShell>
  );
}

export default function SafetyMeetingSignOnPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm" style={{ color: "#8B9BB4" }}>
          Loading sign-on…
        </p>
      }
    >
      <SignOnInner />
    </Suspense>
  );
}
