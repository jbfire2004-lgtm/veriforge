"use client";

import { useEffect, useState } from "react";
import {
  SclHecaEnergyPanel,
  type SclHecaEnergyValue,
} from "@/components/sms/SclHecaEnergyPanel";
import {
  classifyInvestigationScl,
  fetchHecaLibrary,
  type SclState,
  type SmsHecaLibraryEntry,
} from "@/lib/pm-sms-core";
import { WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  eventId: string;
  companyId: number;
  initialHecaCode?: string | null;
  onSaved?: () => void;
};

export function IncidentSmsClassificationPanel({
  eventId,
  companyId,
  initialHecaCode,
  onSaved,
}: Props) {
  const [value, setValue] = useState<SclHecaEnergyValue>({
    hecaInvolved: Boolean(initialHecaCode),
    hecaCategoryCode: initialHecaCode ?? undefined,
  });
  const [triggers, setTriggers] = useState("");
  const [precursors, setPrecursors] = useState("");
  const [hecaOptions, setHecaOptions] = useState<Array<{ code: string; title: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void fetchHecaLibrary(companyId)
      .then((rows) =>
        setHecaOptions(
          (rows as SmsHecaLibraryEntry[]).map((h) => ({ code: h.code, title: h.title })),
        ),
      )
      .catch(() => undefined);
  }, [companyId]);

  async function save() {
    if (!value.sclState) {
      setError("Select an SCL state before saving.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await classifyInvestigationScl(eventId, {
        sclState: value.sclState as SclState,
        triggers: triggers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        precursors: precursors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setNote("Investigation SCL classification saved.");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save SCL classification.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <WorkspaceSection
        title="SCL classification"
        description="Classify this investigation using Safe / Conditional / Loss (SCL) and link HECA or high-energy exposure."
      >
        <SclHecaEnergyPanel value={value} onChange={setValue} hecaOptions={hecaOptions} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sms-triggers">SCL triggers (comma-separated)</Label>
            <Input
              id="sms-triggers"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="e.g. unguarded edge, energised circuit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sms-precursors">SCL precursors (comma-separated)</Label>
            <Input
              id="sms-precursors"
              value={precursors}
              onChange={(e) => setPrecursors(e.target.value)}
              placeholder="e.g. rushing, incomplete briefing"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
            {busy ? "Saving…" : "Save SCL classification"}
          </Button>
          {note ? <span className="text-sm text-emerald-700">{note}</span> : null}
          {error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      </WorkspaceSection>
    </div>
  );
}
