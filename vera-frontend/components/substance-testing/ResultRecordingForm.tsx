"use client";

import { useState } from "react";
import {
  recordTestResult,
  OUTCOME_LABELS,
  OUTCOME_COLORS,
  type SubstanceTestResultOutcome,
  type SubstanceTestEvent,
} from "@/lib/pm-substance-testing";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

const OUTCOMES: SubstanceTestResultOutcome[] = [
  "negative",
  "non_negative",
  "refusal",
  "tampered",
  "dilute",
  "cancelled",
];

type Props = {
  test: SubstanceTestEvent;
  onComplete: () => void;
};

export function ResultRecordingForm({ test, onComplete }: Props) {
  const [outcome, setOutcome] = useState<SubstanceTestResultOutcome | "">("");
  const [mroNotes, setMroNotes] = useState("");
  const [alcoholLevel, setAlcoholLevel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (test.result) {
    const o = test.result.outcome;
    return (
      <WorkspaceSection title="Test result recorded">
        <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${OUTCOME_COLORS[o]}`}>
          {OUTCOME_LABELS[o]}
        </div>
        <p className="mt-2 text-sm text-[#64748b]">
          Recorded {new Date(test.result.recordedAt).toLocaleString()}
        </p>
        {test.result.mroNotes ? (
          <p className="mt-2 text-sm text-[#5a6b7c]">MRO notes: {test.result.mroNotes}</p>
        ) : null}
        {test.result.complianceApplied ? (
          <p className="mt-2 text-xs text-[#2F8F8C]">
            Compliance actions applied (HR, safety, supervisor notified; worker restrictions updated).
          </p>
        ) : null}
      </WorkspaceSection>
    );
  }

  async function submit() {
    if (!outcome) return;
    setBusy(true);
    setMessage(null);
    try {
      await recordTestResult(test.id, {
        outcome,
        mroNotes: mroNotes || undefined,
        alcoholLevel: alcoholLevel ? parseFloat(alcoholLevel) : undefined,
      });
      setMessage("Result recorded. Notifications sent to HR, safety, and supervisors.");
      onComplete();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to record result");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Record test result"
      description="Non-negative, refusal, and tampered outcomes trigger automatic compliance workflows."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {OUTCOMES.map((o) => (
          <button
            key={o}
            type="button"
            className={`rounded-xl border-2 p-3 text-sm font-medium transition ${
              outcome === o
                ? "border-[#2F8F8C] ring-2 ring-[#2F8F8C]/20"
                : "border-[#2A2E33]/10 hover:border-[#2F8F8C]/40"
            } ${OUTCOME_COLORS[o]}`}
            onClick={() => setOutcome(o)}
          >
            {OUTCOME_LABELS[o]}
          </button>
        ))}
      </div>

      {test.specimenType === "breath_alcohol" ? (
        <input
          className="mt-4 w-full max-w-xs rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
          placeholder="BAC level (e.g. 0.02)"
          value={alcoholLevel}
          onChange={(e) => setAlcoholLevel(e.target.value)}
        />
      ) : null}

      <textarea
        className="mt-3 w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
        rows={3}
        placeholder="MRO notes (optional)"
        value={mroNotes}
        onChange={(e) => setMroNotes(e.target.value)}
      />

      <Button
        type="button"
        size="sm"
        className="mt-3"
        disabled={busy || !outcome}
        onClick={() => void submit()}
      >
        {busy ? "Recording…" : "Record result & apply compliance"}
      </Button>

      {message ? (
        <p className={`mt-2 text-sm ${message.startsWith("Result") ? "text-[#2F8F8C]" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </WorkspaceSection>
  );
}
