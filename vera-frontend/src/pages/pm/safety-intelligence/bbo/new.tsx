"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createBboObservation } from "@/lib/safety-intelligence";
import { VeraPageLayout } from "@/src/components/navigation";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfFloatingTextarea,
} from "@/src/components/safety-forms/ui";

const CATEGORIES = [
  { id: "body_position", label: "Body position" },
  { id: "ppe", label: "PPE" },
  { id: "tools_equipment", label: "Tools & equipment" },
  { id: "procedures", label: "Procedures" },
  { id: "housekeeping", label: "Housekeeping" },
  { id: "line_of_fire", label: "Line of fire" },
  { id: "other", label: "Other" },
] as const;

const ANTECEDENTS = [
  "time_pressure",
  "unclear_instruction",
  "missing_tools",
  "poor_access",
  "equipment_design",
  "fatigue",
  "other",
] as const;

const ANTECEDENT_LABELS: Record<(typeof ANTECEDENTS)[number], string> = {
  time_pressure: "Time pressure",
  unclear_instruction: "Unclear instruction",
  missing_tools: "Missing tools / materials",
  poor_access: "Poor access / layout",
  equipment_design: "Equipment design",
  fatigue: "Fatigue",
  other: "Other",
};

export default function BboNewPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState("1");
  const [ownerCompanyId, setOwnerCompanyId] = useState("1");
  const [locationNote, setLocationNote] = useState("");
  const [workActivity, setWorkActivity] = useState("");
  const [workersObservedCount, setWorkersObservedCount] = useState("1");
  const [behaviorCategory, setBehaviorCategory] =
    useState<(typeof CATEGORIES)[number]["id"]>("procedures");
  const [polarity, setPolarity] = useState<"safe" | "at_risk">("safe");
  const [description, setDescription] = useState("");
  const [safeBehaviors, setSafeBehaviors] = useState("");
  const [atRiskBehaviors, setAtRiskBehaviors] = useState("");
  const [antecedents, setAntecedents] = useState<string[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState(true);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [workerResponse, setWorkerResponse] = useState("");
  const [actionAgreed, setActionAgreed] = useState("");
  const [actionDueAt, setActionDueAt] = useState("");
  const [steeringEscalate, setSteeringEscalate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chipClass = useMemo(
    () =>
      "rounded-[3px] border border-[var(--sf-border)] px-2.5 py-1.5 text-xs font-medium transition-colors",
    [],
  );

  function toggleAntecedent(id: string) {
    setAntecedents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const row = await createBboObservation({
        projectId: Number(projectId),
        polarity,
        behaviorDescription: description,
        locationNote: locationNote || undefined,
        workActivity: workActivity || undefined,
        workersObservedCount: workersObservedCount
          ? Number(workersObservedCount)
          : undefined,
        behaviorCategory,
        safeBehaviors: safeBehaviors || undefined,
        atRiskBehaviors: atRiskBehaviors || undefined,
        antecedents: polarity === "at_risk" ? antecedents : undefined,
        feedbackGiven,
        feedbackNotes: feedbackNotes || undefined,
        workerResponse: workerResponse || undefined,
        actionAgreed: actionAgreed || undefined,
        actionDueAt: actionDueAt || undefined,
        steeringEscalate,
        ownerCompanyId:
          polarity === "at_risk" ? Number(ownerCompanyId) : undefined,
        severity: polarity === "at_risk" ? "medium" : undefined,
      });
      if (row.cailEntry?.id) {
        router.push(`/pm/safety-intelligence/${row.cailEntry.id}`);
      } else {
        router.push("/pm/safety-intelligence/bbo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VeraPageLayout
      title="New behaviour-based observation"
      description="ABC / STOP-style observation — reinforce safe work, coach at-risk behaviours, and capture one owned follow-up."
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm text-[var(--sf-text-muted)]">
          Prefer the dedicated BBO flow over free-text forms. At-risk observations
          open Action Management (CAIL) when an owner company is set.
        </p>
        <SfCard className="p-6">
          <form className="space-y-6" onSubmit={(e) => void submit(e)}>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                1. Context
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <SfFloatingInput
                  label="Project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                />
                <SfFloatingInput
                  label="Workers observed"
                  value={workersObservedCount}
                  onChange={(e) => setWorkersObservedCount(e.target.value)}
                />
              </div>
              <SfFloatingInput
                label="Location / area"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
              />
              <SfFloatingInput
                label="Work activity"
                value={workActivity}
                onChange={(e) => setWorkActivity(e.target.value)}
                required
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                2. Behaviour category
              </h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${chipClass} ${
                      behaviorCategory === c.id
                        ? "border-[#1E6FB8] bg-[rgba(30,111,184,0.16)] text-[var(--sf-text)]"
                        : "text-[var(--sf-text-muted)]"
                    }`}
                    onClick={() => setBehaviorCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                3. Observation
              </h2>
              <label className="block text-sm">
                Polarity
                <select
                  className="mt-1 w-full rounded-[3px] border border-[var(--sf-border)] bg-transparent px-3 py-2"
                  value={polarity}
                  onChange={(e) =>
                    setPolarity(e.target.value as "safe" | "at_risk")
                  }
                >
                  <option value="safe">Safe — reinforce</option>
                  <option value="at_risk">At risk — coach</option>
                </select>
              </label>
              <SfFloatingTextarea
                label="Summary of what you observed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <SfFloatingTextarea
                label="Safe behaviours to reinforce (optional)"
                value={safeBehaviors}
                onChange={(e) => setSafeBehaviors(e.target.value)}
              />
              {polarity === "at_risk" && (
                <SfFloatingTextarea
                  label="At-risk behaviours"
                  value={atRiskBehaviors}
                  onChange={(e) => setAtRiskBehaviors(e.target.value)}
                />
              )}
            </section>

            {polarity === "at_risk" && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  4. Antecedents (ABC)
                </h2>
                <p className="text-xs text-[var(--sf-text-muted)]">
                  What triggered the at-risk behaviour?
                </p>
                <div className="flex flex-wrap gap-2">
                  {ANTECEDENTS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`${chipClass} ${
                        antecedents.includes(id)
                          ? "border-[#C89F3D] bg-[rgba(200,159,61,0.16)]"
                          : "text-[var(--sf-text-muted)]"
                      }`}
                      onClick={() => toggleAntecedent(id)}
                    >
                      {ANTECEDENT_LABELS[id]}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {polarity === "at_risk" ? "5" : "4"}. Immediate feedback
              </h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={feedbackGiven}
                  onChange={(e) => setFeedbackGiven(e.target.checked)}
                />
                Gave immediate coaching / praise on the spot
              </label>
              <SfFloatingTextarea
                label="What was said"
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
              />
              <SfFloatingTextarea
                label="Worker response (optional)"
                value={workerResponse}
                onChange={(e) => setWorkerResponse(e.target.value)}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {polarity === "at_risk" ? "6" : "5"}. Follow-up
              </h2>
              <SfFloatingTextarea
                label="One action agreed"
                value={actionAgreed}
                onChange={(e) => setActionAgreed(e.target.value)}
              />
              <SfFloatingInput
                label="Action due (ISO date, optional)"
                value={actionDueAt}
                onChange={(e) => setActionDueAt(e.target.value)}
                placeholder="2026-08-30"
              />
              {polarity === "at_risk" && (
                <SfFloatingInput
                  label="Owner company ID (required for CAIL)"
                  value={ownerCompanyId}
                  onChange={(e) => setOwnerCompanyId(e.target.value)}
                  required
                />
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={steeringEscalate}
                  onChange={(e) => setSteeringEscalate(e.target.checked)}
                />
                Escalate to steering committee (systemic issue)
              </label>
            </section>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <SfButton type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Submit observation"}
              </SfButton>
              <Link
                href="/pm/safety-intelligence/bbo"
                className="inline-flex items-center text-sm text-[var(--sf-primary)]"
              >
                Cancel
              </Link>
            </div>
          </form>
        </SfCard>
      </div>
    </VeraPageLayout>
  );
}
