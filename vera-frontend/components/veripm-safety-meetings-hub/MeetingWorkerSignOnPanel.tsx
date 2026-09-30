"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import {
  WorkerPicker,
  type WorkerPickerOption,
} from "@/components/workers/WorkerPicker";
import {
  signOnToSafetyMeeting,
  type SafetyMeeting,
} from "@/lib/pm-safety-meetings";
import { validateSiteAccess } from "@/lib/pm-site-access-control";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  meetingId: string;
  projectId: number;
  meetingStatus: string;
  session?: Session | null;
  tokenReady?: boolean;
  onSignedOn?: (meeting: SafetyMeeting) => void;
  /** Compact embed vs full kiosk panel */
  variant?: "panel" | "kiosk";
};

/**
 * Worker sign-on for safety meetings — same presence pattern as FLHA crew ack:
 * select worker → acknowledge → mark present on project for this talk.
 */
export function MeetingWorkerSignOnPanel({
  meetingId,
  projectId,
  meetingStatus,
  session,
  tokenReady = true,
  onSignedOn,
  variant = "panel",
}: Props) {
  const [workerId, setWorkerId] = useState<number | null>(null);
  const [worker, setWorker] = useState<WorkerPickerOption | null>(null);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [presenceNote, setPresenceNote] = useState<string | null>(null);

  const canSign =
    meetingStatus === "published" || meetingStatus === "in_progress";

  async function submit() {
    if (!workerId || !worker) {
      setError("Select the worker who is signing on.");
      return;
    }
    if (!ack) {
      setError("Worker must acknowledge they attended and are on this project.");
      return;
    }
    if (!tokenReady) {
      setError("Session still preparing — try again in a moment.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    setPresenceNote(null);
    try {
      const signerName = `${worker.firstName} ${worker.lastName}`.trim();
      const result = await signOnToSafetyMeeting(
        meetingId,
        {
          workerId,
          signerName,
          signatureData: `ack:${signerName}:on_project:${projectId}:${new Date().toISOString()}`,
        },
        { session },
      );

      // Best-effort on-project presence record (does not block sign-on).
      try {
        const access = await validateSiteAccess({
          workerId,
          projectId,
        });
        setPresenceNote(
          access.granted
            ? "Site access recorded — worker marked on project."
            : `Signed on to meeting. Site access note: ${(access.denialReasons ?? []).join("; ") || access.decision}`,
        );
      } catch {
        setPresenceNote(
          "Signed on to meeting. Site access presence will sync when the gate is available.",
        );
      }

      setSuccess(
        `${signerName} signed on — present for this talk and on-project for attendance tracking.`,
      );
      setAck(false);
      setWorkerId(null);
      setWorker(null);
      onSignedOn?.(result.meeting);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign-on failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const pad = variant === "kiosk" ? "p-6" : "p-4";

  return (
    <div className={`vs-panel ${pad}`}>
      <p className="vs-eyebrow">Worker sign-on</p>
      <h3
        className="mt-1 text-base font-semibold"
        style={{ color: VS_COLORS.white }}
      >
        Sign on — confirm you are here
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: VS_COLORS.muted }}>
        Like FLHA crew acknowledgment: signing this toolbox / safety meeting
        records that the worker is <strong style={{ color: VS_COLORS.white }}>on the project
        and at work</strong> for this shift talk. Use this for attendance and
        leading-indicator tracking.
      </p>

      {!canSign ? (
        <p
          className="mt-3 rounded border px-3 py-2 text-sm"
          style={{
            borderColor: VS_COLORS.orange,
            color: VS_COLORS.orange,
            background: VS_COLORS.slate,
          }}
        >
          {meetingStatus === "draft"
            ? "Publish or start the meeting before workers can sign on."
            : `Meeting is ${meetingStatus.replaceAll("_", " ")} — sign-on is closed.`}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: VS_COLORS.muted }}
            >
              Find worker
            </p>
            <div
              className="rounded border p-2"
              style={{
                borderColor: VS_COLORS.border,
                background: VS_COLORS.slate,
              }}
            >
              <WorkerPicker
                value={workerId}
                onChange={(id, w) => {
                  setWorkerId(id);
                  setWorker(w ?? null);
                  setSuccess(null);
                  setError(null);
                }}
                placeholder="Search by name…"
              />
            </div>
            {worker ? (
              <p className="mt-2 text-sm" style={{ color: VS_COLORS.blue }}>
                Selected: {worker.firstName} {worker.lastName}
                {worker.company?.name ? ` · ${worker.company.name}` : ""}
              </p>
            ) : null}
          </div>

          <label className="flex items-start gap-3 text-sm" style={{ color: VS_COLORS.muted }}>
            <input
              type="checkbox"
              className="mt-1"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>
              I attended this safety meeting / toolbox talk, understand the hazards
              and controls discussed, and confirm I am working on this project today.
            </span>
          </label>

          <button
            type="button"
            disabled={busy || !tokenReady || !workerId || !ack}
            className="rounded px-4 py-2.5 text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
            style={{ background: VS_COLORS.emerald, color: VS_COLORS.navy }}
            onClick={() => void submit()}
          >
            {busy ? "Signing on…" : "Sign on & mark present"}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm" style={{ color: VS_COLORS.critical }} role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm" style={{ color: VS_COLORS.emerald }} role="status">
          {success}
        </p>
      ) : null}
      {presenceNote ? (
        <p className="mt-2 text-xs" style={{ color: VS_COLORS.muted }}>
          {presenceNote}
        </p>
      ) : null}
    </div>
  );
}
