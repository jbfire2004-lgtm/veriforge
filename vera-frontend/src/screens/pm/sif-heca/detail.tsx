"use client";

import { useEffect, useState } from "react";
import {
  fetchSifHecaOrchestrator,
  getSifHecaEvent,
  reviewSifHecaEvent,
  type SifHecaEvent,
  type VeraOrchestratorAnalysis,
} from "@/lib/sif-heca";
import { VeraOrchestratorPanel } from "@/src/components/pm/VeraOrchestratorPanel";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";

export default function SifHecaDetailPage({ id }: { id: string }) {
  const [event, setEvent] = useState<SifHecaEvent | null>(null);
  const [orchestrator, setOrchestrator] = useState<VeraOrchestratorAnalysis | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    void getSifHecaEvent(id).then(setEvent).catch(() => undefined);
    void fetchSifHecaOrchestrator(id).then(setOrchestrator).catch(() => undefined);
  }, [id]);

  async function runReview(action: "approve" | "reject" | "request_changes") {
    const updated = await reviewSifHecaEvent(id, action, reviewNotes || undefined);
    setEvent(updated);
    void fetchSifHecaOrchestrator(id).then(setOrchestrator).catch(() => undefined);
  }

  if (!event) {
    return <div className="p-8 text-sm">Loading…</div>;
  }

  return (
    <VeraPageLayout
      title={event.title}
      description={`${event.sourceType} · ${event.status}`}
    >
      {event.sifScore ? (
        <SfCard className="space-y-2 p-5">
          <h2 className="font-medium">SIF scoring</h2>
          <p>
            Score <strong>{event.sifScore.sifScore}</strong> — category{" "}
            <strong>{event.sifScore.sifCategory}</strong>
            {event.sifScore.requiresSupervisorReview
              ? " · Supervisor review required"
              : ""}
          </p>
          <ul className="text-xs text-[var(--sf-text-muted)]">
            {event.sifScore.explainability?.map((x) => (
              <li key={x.rule}>
                {x.detail} (+{x.points})
              </li>
            ))}
          </ul>
          {event.sifScore.requiredControls?.length ? (
            <div>
              <p className="text-xs font-medium text-[var(--sf-text-muted)]">Required controls</p>
              <ul className="list-disc pl-5 text-sm">
                {event.sifScore.requiredControls.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </SfCard>
      ) : null}

      {event.hecaScore ? (
        <SfCard className="space-y-2 p-5">
          <h2 className="font-medium">HECA classification</h2>
          <p>
            {event.hecaScore.hecaCategoryLabel} — risk {event.hecaScore.hecaRiskScore}
            {event.hecaScore.highEnergyFlag ? " · High energy" : ""}
          </p>
          {event.hecaScore.requiredCorrective?.length ? (
            <ul className="list-disc pl-5 text-sm text-[var(--sf-text-muted)]">
              {event.hecaScore.requiredCorrective.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : null}
        </SfCard>
      ) : null}

      {orchestrator ? <VeraOrchestratorPanel data={orchestrator} /> : null}

      {event.status === "review_required" || event.status === "scored" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">Supervisor review</h2>
          <SfFloatingTextarea
            label="Review notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={2}
          />
          <div className="flex flex-wrap gap-2">
            <SfButton type="button" onClick={() => void runReview("approve")}>
              Approve
            </SfButton>
            <SfButton variant="secondary" type="button" onClick={() => void runReview("request_changes")}>
              Request changes
            </SfButton>
            <SfButton type="button" onClick={() => void runReview("reject")}>
              Reject
            </SfButton>
          </div>
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}
