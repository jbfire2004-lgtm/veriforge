"use client";

import { useEffect, useState } from "react";
import {
  autosaveSafetyFormDraft,
  submitSafetyFormOffline,
} from "@/lib/field/workflows/safety-form";
import { useFieldMode } from "./FieldModeProvider";
import type { SafetyFormKind } from "@/lib/field";
import { Button, Input, Label, Textarea, Card, CardContent } from "@/components/ui";

const LABELS: Record<SafetyFormKind, string> = {
  JHA: "Job Hazard Analysis",
  FLHA: "Field Level Hazard Assessment",
  SIF: "Serious Injury / Fatality review",
  HECA: "High Energy Control Assessment",
};

export function SafetyFormOffline({
  kind,
  companyId,
  siteId,
}: {
  kind: SafetyFormKind;
  companyId?: number;
  siteId?: number;
}) {
  const { cache, queue } = useFieldMode();
  const [title, setTitle] = useState(`${LABELS[kind]} — ${new Date().toLocaleDateString()}`);
  const [hazards, setHazards] = useState("");
  const [controls, setControls] = useState("");
  const [location, setLocation] = useState("");
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      if (!draftId) return;
      void autosaveSafetyFormDraft({
        id: draftId,
        kind,
        title,
        companyId,
        siteId,
        fields: { hazardSummary: hazards, controlMeasures: controls, jobLocation: location },
        signatureDataUrl: signature || undefined,
      });
    }, 8000);
    return () => clearInterval(t);
  }, [draftId, kind, title, hazards, controls, location, signature, companyId, siteId]);

  useEffect(() => {
    const id = `draft_${kind}_${Date.now()}`;
    setDraftId(id);
    void autosaveSafetyFormDraft({
      id,
      kind,
      title,
      companyId,
      siteId,
      fields: {},
    });
  }, [kind, companyId, siteId, title]);

  async function submit(final: boolean) {
    if (!cache || !queue) return;
    const res = await submitSafetyFormOffline(cache, queue, {
      kind,
      title,
      companyId,
      siteId,
      fields: {
        hazardSummary: hazards,
        controlMeasures: controls,
        jobLocation: location,
      },
      signatureDataUrl: signature || undefined,
      submit: final,
      draftId: draftId ?? undefined,
    });
    setStatus(final ? `Submitted (queued ${res.queueId})` : `Saved offline (${res.queueId})`);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h2 className="text-lg font-semibold">{LABELS[kind]}</h2>
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Hazards</Label>
          <Textarea value={hazards} onChange={(e) => setHazards(e.target.value)} rows={4} />
        </div>
        <div>
          <Label>Controls</Label>
          <Textarea value={controls} onChange={(e) => setControls(e.target.value)} rows={4} />
        </div>
        <div>
          <Label>Job location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <Label>Signature (data URL or initials)</Label>
          <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Initials" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void submit(false)}>
            Save draft offline
          </Button>
          <Button type="button" variant="primary" onClick={() => void submit(true)}>
            Submit when synced
          </Button>
        </div>
        {status && <p className="text-sm">{status}</p>}
      </CardContent>
    </Card>
  );
}
