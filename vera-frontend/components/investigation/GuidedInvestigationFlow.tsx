"use client";

import { useEffect, useState } from "react";
import {
  getGuidedQuestions,
  saveGuidedAnswers,
  getInvestigationSuggestions,
  addPmIncidentContributingFactor,
  type GuidedQuestion,
  type TaprootPathway,
} from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";
import { Skeleton } from "@/components/ui/skeleton";

const PATHWAY_COLORS: Record<string, string> = {
  human_factors: "bg-amber-50 border-amber-200",
  equipment_failure: "bg-red-50 border-red-200",
  procedures: "bg-blue-50 border-blue-200",
  training_gaps: "bg-purple-50 border-purple-200",
  management_systems: "bg-orange-50 border-orange-200",
  environmental_conditions: "bg-green-50 border-green-200",
};

type Props = {
  eventId: string;
  onComplete?: () => void;
};

export function GuidedInvestigationFlow({ eventId, onComplete }: Props) {
  const [questions, setQuestions] = useState<GuidedQuestion[] | null>(null);
  const [pathways, setPathways] = useState<TaprootPathway[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{ label: string; pathway: string; confidence: number }>
  >([]);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    void getGuidedQuestions(eventId).then((d) => {
      setQuestions(d.questions);
      setPathways(d.pathways);
      setStep(d.currentStep);
      setSuggestions(d.suggestedContributingFactors);
    });
  }, [eventId]);

  const q = questions?.[step];

  async function next() {
    if (!q) return;
    setBusy(true);
    try {
      const updated = await saveGuidedAnswers(eventId, answers);
      setStep(updated.currentStep);
      const s = await getInvestigationSuggestions(eventId);
      setSuggestions(s.contributingFactors);
    } finally {
      setBusy(false);
    }
  }

  async function addFactor(label: string, pathway: string) {
    if (added.has(label)) return;
    await addPmIncidentContributingFactor(eventId, { label, category: pathway });
    setAdded((s) => new Set([...s, label]));
  }

  if (!questions) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const done = step >= questions.length;

  return (
    <div className="space-y-6">
      <WorkspaceSection
        title="Guided investigation"
        description={`Step ${Math.min(step + 1, questions.length)} of ${questions.length} — ${done ? "Complete" : "TapRooT causal pathway analysis"}`}
      >
        {!done && q ? (
          <div className="space-y-4">
            <div
              className={`rounded-xl border p-4 ${q.pathway ? (PATHWAY_COLORS[q.pathway] ?? "bg-slate-50 border-slate-200") : "bg-white border-[#2A2E33]/10"}`}
            >
              {q.pathway ? (
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#64748b]">
                  {pathways.find((p) => p.key === q.pathway)?.label ?? q.pathway}
                </p>
              ) : null}
              <p className="font-medium text-[#2A2E33]">{q.prompt}</p>
              <textarea
                className="mt-3 w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
                rows={3}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Enter your findings…"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={busy} onClick={() => void next()}>
                {busy ? "Saving…" : step < questions.length - 1 ? "Next →" : "Finish"}
              </Button>
              {step > 0 ? (
                <Button type="button" size="sm" variant="outline" onClick={() => setStep((s) => s - 1)}>
                  ← Back
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#2F8F8C]">
              Guided investigation complete. Review auto-suggested contributing factors below.
            </p>
            <Button type="button" size="sm" onClick={() => onComplete?.()}>
              Continue to root cause analysis →
            </Button>
          </div>
        )}
      </WorkspaceSection>

      {suggestions.length > 0 ? (
        <WorkspaceSection
          title="Auto-suggested contributing factors"
          description="Based on your answers. Click to add to the investigation."
        >
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li
                key={s.label}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${PATHWAY_COLORS[s.pathway] ?? "bg-white border-[#2A2E33]/10"}`}
              >
                <div>
                  <span className="font-medium text-[#2A2E33]">{s.label}</span>
                  <span className="ml-2 text-[#64748b]">
                    ({Math.round(s.confidence * 100)}%)
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={added.has(s.label)}
                  onClick={() => void addFactor(s.label, s.pathway)}
                >
                  {added.has(s.label) ? "Added" : "Add"}
                </Button>
              </li>
            ))}
          </ul>
        </WorkspaceSection>
      ) : null}
    </div>
  );
}
